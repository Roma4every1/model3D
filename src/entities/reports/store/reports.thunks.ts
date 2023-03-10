import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { fillChannels } from 'entities/channels';
import { fillParamValues } from '../../parameters';
import { applyChannelsDeps } from 'widgets/presentation/lib/channels-auto-update';
import { createClientChannels } from 'widgets/presentation/lib/initialization';
import { initializeReport, updateReportParam } from './reports.actions';
import { setReportModels, setCanRunReport, setReportChannels } from './reports.actions';
import { applyReportVisibility } from '../lib/common';
import { formsAPI } from 'widgets/presentation/lib/forms.api';
import { reportsAPI } from 'entities/reports/lib/reports.api';


export const initializeActiveReport = (id: FormID, reportID: ReportID): Thunk => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const [parameters, hiddenParameters] = await Promise.all([
      formsAPI.getFormParameters(reportID),
      reportsAPI.getReportParametersHidden(reportID),
    ]);

    const state = getState();
    const rootID = state.root.id;
    const parametersState = state.parameters;

    for (const paramID in hiddenParameters) {
      let param = parametersState[rootID].find(p => p.id === paramID);
      if (!param) param = parametersState[id].find(p => p.id === paramID);
      if (param) parameters.push(structuredClone(param));

      param = parameters.find(p => p.id === paramID);
      if (param && hiddenParameters[paramID] === true) param.editorType = null;
    }

    const paramDict = {[reportID]: parameters};
    const channels = await createClientChannels(new Set(), paramDict, []);
    applyChannelsDeps(channels, paramDict);
    await fillChannels(channels, {...state.parameters, [reportID]: parameters});

    const initData: ReportInitData = {
      parameters, channels,
      canRun: await reportsAPI.getCanRunReport(reportID, parameters),
    };
    dispatch(initializeReport(id, reportID, initData));
  };
};

export const updateReportParameter = (id: FormID, reportID: ReportID, paramID: ParameterID, value: any): Thunk => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();

    const report = state.reports.models[id].find(r => r.id === reportID);
    if (!report) return;
    const param = report.parameters.find(p => p.id === paramID);
    if (!param) return;

    param.value = value;
    dispatch(updateReportParam(id, reportID, paramID, value));

    if (param.relatedChannels) {
      const dict = {};
      param.relatedChannels.forEach((name) => dict[name] = report.channels[name]);
      await fillChannels(dict, {[reportID]: report.parameters});
      dispatch(setReportChannels(id, reportID, {...report.channels}));
    }

    const canRun = await reportsAPI.getCanRunReport(reportID, report.parameters);
    dispatch(setCanRunReport(id, reportID, canRun));
  };
};

/** Обновляет видимость программ по набору идентификаторов. */
export const updateReportsVisibility = (ids: ReportID[]): Thunk => {
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
};
