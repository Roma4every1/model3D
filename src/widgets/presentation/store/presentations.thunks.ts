import { Dispatch } from 'redux';
import { StateGetter, Thunk } from 'shared/lib';
import { createReportModels, setReportModels } from 'entities/reports';
import { fillChannels, setChannels } from 'entities/channels';
import { getPresentationParams, getPresentationChannels } from '../lib/initialization';
import { createPresentationState, createClientChannels, createFormStates } from '../lib/initialization';
import { applyChannelsDeps } from '../lib/utils';

import { setParamDict } from 'entities/parameters';
import { fetchFormsStart, fetchFormsEnd, fetchFormError } from 'entities/fetch-state';
import { setPresentationState } from './presentations.actions';
import { createTableState } from 'features/table';
import { createCaratState } from 'features/carat';
import { createChartState } from 'features/chart';
import { createMapState } from 'features/map';
import { setFormsState } from 'widgets/presentation/store/forms.actions';


/** Инициализация презентации. */
export const fetchPresentationState = (id: FormID): Thunk => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    dispatch(fetchFormsStart([id]));

    const presentation = await createPresentationState(id);
    if (!presentation) {
      dispatch(fetchFormError(id, 'ошибка при инициализации презентации'));
      return;
    }

    const children = presentation.children;
    const childrenID = children.map(child => child.id);
    const paramDict = await getPresentationParams(id, childrenID);
    dispatch(setParamDict(paramDict));

    const state = getState();
    const rootID = state.root.id;

    const reportParamDict = {[rootID]: state.parameters[rootID], [id]: paramDict[id]};
    const reportModels = await createReportModels(reportParamDict, rootID, id);

    dispatch(fetchFormsStart(childrenID));
    dispatch(setReportModels(id, reportModels));
    dispatch(setPresentationState(presentation));
    dispatch(fetchFormsEnd([id]));

    const [baseChannels, childrenChannelNames] = await getPresentationChannels(id, childrenID);
    const formsState = await createFormStates(id, children, childrenChannelNames);

    const existingChannels = Object.keys(state.channels);
    const channels = await createClientChannels(baseChannels, paramDict, existingChannels);

    const allChannels = {...state.channels, ...channels};
    for (const id of childrenID) createFormState(id, formsState[id], allChannels, dispatch);

    paramDict[rootID] = state.parameters[rootID];
    applyChannelsDeps(allChannels, paramDict);
    await fillChannels(channels, paramDict);

    dispatch(setChannels(channels));
    dispatch(setFormsState(formsState));
    dispatch(fetchFormsEnd(childrenID));
  };
};

function createFormState(id: FormID, state: FormState, channels: ChannelDict, dispatch: Dispatch): void {
  const type = state.type;

  if (type === 'dataSet') {
    const channel = channels[state.channels[0]];
    dispatch(createTableState(id, channel, state.settings));
  } else if (type === 'carat') {
    dispatch(createCaratState(id, channels, state));
  } else if (type === 'chart') {
    dispatch(createChartState(id, state.settings));
  } else if (type === 'map') {
    dispatch(createMapState(id, state.parent));
  }
}
