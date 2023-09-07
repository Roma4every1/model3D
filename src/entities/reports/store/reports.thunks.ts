import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { fillChannels, updateTables } from 'entities/channels';
import { fillParamValues } from 'entities/parameters';
import { showInfoMessage, showWarningMessage } from 'entities/window';
import { showNotification } from 'entities/notifications';
import { applyChannelsDeps } from 'widgets/presentation/lib/utils';
import { createClientChannels } from 'widgets/presentation/lib/initialization';
import { initializeReport, updateReportParam } from './reports.actions';
import { setReportModels, setCanRunReport, setReportChannels } from './reports.actions';
import { applyReportVisibility, updateReportChannelData, watchOperation } from '../lib/common';
import { reportsAPI } from 'entities/reports/lib/report.api.ts';
import { t } from 'shared/locales';


export function initializeActiveReport(id: ClientID, reportID: ReportID): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const res = await reportsAPI.getReportData(reportID);
    if (res.ok === false) { dispatch(showWarningMessage(res.data)); return; }

    const { parameters, replaces, linkedPropertyCount } = res.data;

    const state = getState();
    const rootID = state.root.id;
    const parametersState = state.parameters;

    for (const paramID in replaces) {
      let param = parameters.find(p => p.id === paramID);
      if (!param) {
        param =
          parametersState[rootID].find(p => p.id === paramID) ??
          parametersState[id].find(p => p.id === paramID);

        if (param) {
          param = structuredClone(param);
          parameters.push(param);
        }
      }
      if (param && replaces[paramID] === true) param.editorType = null;
    }

    const paramDict = {[reportID]: parameters};
    const channels = await createClientChannels(new Set(), paramDict, []);
    applyChannelsDeps(channels, paramDict);

    for (const name in channels) {
      const info = channels[name].info;
      info.clients.add(rootID); info.clients.add(id);

      for (const paramID of info.parameters) {
        if (parameters.some(p => p.id === paramID)) continue;
        const param = parametersState[rootID].find(p => p.id === paramID);
        if (!param) continue;

        let relatedChannels = param.relatedReportChannels.find(item => item.reportID === reportID);
        if (!relatedChannels) {
          relatedChannels = {clientID: id, reportID, channels: []};
          param.relatedReportChannels.push(relatedChannels);
        }
        relatedChannels.channels.push(name);
      }
    }

    paramDict[rootID] = parametersState[rootID];
    paramDict[id] = parametersState[id];
    await fillChannels(channels, paramDict);

    const initData: ReportInitData = {
      parameters, channels, linkedPropertyCount,
      canRun: await reportsAPI.getCanRunReport(reportID, parameters),
    };
    dispatch(initializeReport(id, reportID, initData));
  };
}

export function runReport(report: ReportModel): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { id, parameters, linkedPropertyCount } = report;

    for (let i = 0; i < linkedPropertyCount; i++) {
      const { data } = await reportsAPI.executeReportProperty(id, i, parameters);
      if (typeof data === 'string') { dispatch(showWarningMessage(data)); return; }

      const modifiedTables = data.modifiedTables;
      if (modifiedTables.length) updateTables(modifiedTables)(dispatch, getState).then();

      if (data.result) {
        const title = t(`report.${report.type}-result`);
        dispatch(showInfoMessage(data.result, title));
      }
      parameters.forEach(param => {
        if (param.editorType === 'fileTextEditor') {
          dispatch(updateReportParam(id, report.id, param.id, null));
        }
      });

      if (data.operationID) {
        showNotification(t('report.start', {programName: report.displayName}))(dispatch).then();
        await watchOperation(report, data.operationID, dispatch, getState);
      }
    }
  };
}

export function updateReportParameter(id: FormID, reportID: ReportID, paramID: ParameterID, value: any): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { root, reports, parameters } = getState();

    const report = reports.models[id].find(r => r.id === reportID);
    if (!report) return;
    const param = report.parameters.find(p => p.id === paramID);
    if (!param) return;

    param.value = value;
    dispatch(updateReportParam(id, reportID, paramID, value));

    if (param.relatedChannels.length) {
      await updateReportChannelData(report, param.relatedChannels, root.id, id, parameters);
      dispatch(setReportChannels(id, reportID, {...report.channels}));
    }

    const canRun = await reportsAPI.getCanRunReport(reportID, report.parameters);
    dispatch(setCanRunReport(id, reportID, canRun));
  };
}

/** Обновляет связанные каналы отчётов. */
export function reloadReportChannels(entries: RelatedReportChannels[]): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const promises: Promise<void>[] = [];
    const { reports, root, parameters } = getState();

    for (const { clientID, reportID, channels } of entries) {
      const report = reports.models[clientID]?.find(r => r.id === reportID);
      if (report) {
        promises.push(updateReportChannelData(report, channels, root.id, clientID, parameters));
      }
    }
    await Promise.all(promises);
  };
}

/** Обновляет видимость программ по набору идентификаторов. */
export function updateReportsVisibility(ids: ReportID[]): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const { parameters, reports: { models }, root: { id: rootID } } = state;

    const changedClients: FormID[] = [];
    const changedReports: Promise<void>[] = [];

    for (const clientID in models) {
      const reports = models[clientID].filter(m => ids.includes(m.id));
      if (reports.length === 0) continue;

      changedClients.push(clientID);
      const clients = [rootID, clientID];

      changedReports.push(...reports.map((report) => {
        const params = fillParamValues(report.paramsForCheckVisibility, parameters, clients);
        return applyReportVisibility(report, params)
      }));
    }

    await Promise.all(changedReports);
    for (const clientID of changedClients) {
      dispatch(setReportModels(clientID, [...models[clientID]]));
    }
  };
}

/** Обновляет состояние отчёта: перезагружает данные всех каналов. */
export function refreshReport(clientID: FormID, report: ReportModel): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { root, parameters } = getState();
    const names = Object.values(report.channels).map(c => c.name);
    if (names.length) await updateReportChannelData(report, names, root.id, clientID, parameters);
  };
}
