import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { fillChannels } from 'entities/channels';
import { applyChannelsDeps } from 'widgets/presentation/lib/channels-auto-update';
import { createClientChannels } from 'widgets/presentation/lib/initialization';
import { initializeReport, updateReportParam } from './reports.actions';
import { setCanRunReport, setReportChannels } from './reports.actions';
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
