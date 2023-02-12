import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { setWindowWarning } from 'entities/windows';
import { setChannels, fillChannels } from 'entities/channels';
import { createClientChannels } from '../../../../widgets/presentation/lib/initialization';
import { formsAPI } from 'widgets/form/forms.api';
import { programsAPI } from 'entities/reports/lib/programs.api';
import { paramsManager } from '../../../../app/store';


export const fetchReportsParameters = (programID: string): Thunk => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const parameters = await formsAPI.getFormParameters(programID);
    const paramDict = {[programID]: parameters};

    const res = await programsAPI.getReportParameters(programID);
    if (!res.ok) { dispatch(setWindowWarning(res.data)); return; }

    const state = getState();
    const existingChannels = Object.keys(state.channels);

    const channels = await createClientChannels(new Set(), paramDict, existingChannels);
    // TODO: deps
    await fillChannels(channels, state.parameters);
    dispatch(setChannels(channels));

    await paramsManager.getParameterValues(res.data, programID, true);
  };
};
