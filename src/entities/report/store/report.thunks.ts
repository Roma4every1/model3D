import { fillChannels, reloadChannelsByQueryIDs } from 'entities/channel';
import { fillParamValues, useParameterStore } from 'entities/parameter';
import { showInfoMessage, showWarningMessage } from 'entities/window';
import { showNotification } from 'entities/notification';
import { applyChannelsDeps } from 'widgets/presentation/lib/utils';
import { createClientChannels } from 'widgets/presentation/lib/initialization';
import { initializeReport, updateReportParam } from './report.actions';
import { setReportModels, setCanRunReport, setReportChannels } from './report.actions';
import { reportsAPI } from 'entities/report/lib/report.api';
import { t } from 'shared/locales';
import { useRootStore } from '../../../app/store/root-form.store';
import { useReportStore } from './report.store';

import {
  reportCompareFn, cloneReportParameter,
  applyReportAvailability, updateReportChannelData, watchOperation,
} from '../lib/common';


export async function initializeActiveReport(id: ClientID, reportID: ReportID): Promise<void> {
  const res = await reportsAPI.getReportData(reportID);
  if (res.ok === false) { showWarningMessage(res.message); return; }
  const { parameters, replaces, linkedPropertyCount } = res.data;

  const rootID = 'root';
  const parametersState = useParameterStore.getState();

  for (const paramID in replaces) {
    let param = parameters.find(p => p.id === paramID);
    if (!param) {
      param =
        parametersState[rootID].find(p => p.id === paramID) ??
        parametersState[id].find(p => p.id === paramID);

      if (param) {
        param = cloneReportParameter(param);
        parameters.push(param);
      }
    }
    if (param && replaces[paramID] === true) delete param.editor;
  }

  const paramDict = {[reportID]: parameters};
  const channels = await createClientChannels(new Set(), parameters, []);
  applyChannelsDeps(channels, paramDict);

  for (const name in channels) {
    const config = channels[name].config;
    config.clients.add(rootID); config.clients.add(id);

    for (const paramID of config.parameters) {
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
  initializeReport(id, reportID, initData);
}

export async function runReport(clientID: ClientID, report: ReportModel): Promise<void> {
  const reportID = report.id;
  const parameters = report.parameters;

  for (let i = 0; i < report.linkedPropertyCount; i++) {
    const res = await reportsAPI.executeReportProperty(reportID, parameters, i);
    if (res.ok === false) { showWarningMessage(res.message); continue; }
    if (res.data.error) { showWarningMessage(res.data.error); continue; }

    const { operationID, result, modifiedTables } = res.data;
    if (modifiedTables.length) reloadChannelsByQueryIDs(modifiedTables).then();

    if (result) {
      const title = t(`report.${report.type}-result`);
      const style = {whiteSpace: 'pre', maxWidth: 400, maxHeight: 300};
      showInfoMessage(result, title, style);
    }
    if (operationID) {
      showNotification(t('report.start', {name: report.displayName}));
      await watchOperation(report, operationID);
    }
  }
  for (const parameter of parameters) {
    if (parameter.editor?.type !== 'fileTextEditor') continue;
    updateReportParam(clientID, reportID, parameter.id, null);
  }
}

export async function updateReportParameter(id: ClientID, reportID: ReportID, paramID: ParameterID, value: any): Promise<void> {
  const root = useRootStore.getState();
  const reports = useReportStore.getState();
  const parameters = useParameterStore.getState();

  const report = reports.models[id].find(r => r.id === reportID);
  if (!report) return;
  const param = report.parameters.find(p => p.id === paramID);
  if (!param) return;
  updateReportParam(id, reportID, paramID, value);

  if (param.relatedChannels.length) {
    await updateReportChannelData(report, param.relatedChannels, root.id, id, parameters);
    setReportChannels(id, reportID, {...report.channels});
  }

  const canRun = await reportsAPI.getCanRunReport(reportID, report.parameters);
  setCanRunReport(id, reportID, canRun);
}

/** Обновляет связанные каналы отчётов. */
export async function reloadReportChannels(entries: RelatedReportChannels[]): Promise<void> {
  const promises: Promise<void>[] = [];
  const reports = useReportStore.getState();
  const parameters = useParameterStore.getState();

  for (const { clientID, reportID, channels } of entries) {
    const report = reports.models[clientID]?.find(r => r.id === reportID);
    if (report) {
      promises.push(updateReportChannelData(report, channels, 'root', clientID, parameters));
    }
  }
  await Promise.all(promises);
}

/** Обновляет видимость программ по набору идентификаторов. */
export async function updateReportsVisibility(ids: ReportID[]): Promise<void> {
  const models = useReportStore.getState().models;
  const parameters = useParameterStore.getState();

  const changedClients: FormID[] = [];
  const changedReports: Promise<void>[] = [];

  for (const clientID in models) {
    const reports = models[clientID].filter(m => ids.includes(m.id));
    if (reports.length === 0) continue;

    changedClients.push(clientID);
    const clients = ['root', clientID];

    changedReports.push(...reports.map((report) => {
      const params = fillParamValues(report.availabilityParameters, parameters, clients);
      return applyReportAvailability(report, params)
    }));
  }

  await Promise.all(changedReports);
  for (const clientID of changedClients) {
    setReportModels(clientID, models[clientID].toSorted(reportCompareFn));
  }
}

/** Обновляет состояние отчёта: перезагружает данные всех каналов. */
export async function refreshReport(clientID: FormID, report: ReportModel): Promise<void> {
  const parameters = useParameterStore.getState();
  const names = Object.values(report.channels).map(c => c.name);
  if (names.length) await updateReportChannelData(report, names, 'root', clientID, parameters);
}
