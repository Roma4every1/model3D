import { Dispatch } from 'redux';
import { StateGetter, Thunk } from 'shared/lib';
import { createPrograms } from 'entities/reports';
import { fillChannels, setChannels } from 'entities/channels';
import { getPresentationParams, getPresentationChannels } from '../lib/initialization';
import { createPresentationState, createClientChannels, createFormStates } from '../lib/initialization';
import { applyChannelsDeps } from '../lib/channels-auto-update';

import { setParamDict } from 'entities/parameters';
import { fetchFormsStart, fetchFormsEnd, fetchFormError } from 'entities/fetch-state';
import { setPresentationState } from './presentations.actions';
import { createMapState } from 'features/map/store/maps.actions';
import { createCaratState } from 'features/carat/store/carats.actions';
import { setFormsState } from 'widgets/form/store/forms.actions';


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

    const state = getState();
    const rootID = state.root.id;

    const programParamDict = {[rootID]: state.parameters[rootID], [id]: paramDict[id]};
    presentation.programs = await createPrograms(programParamDict, rootID, id);

    dispatch(fetchFormsStart(childrenID));
    dispatch(setPresentationState(presentation));
    dispatch(fetchFormsEnd([id]));

    const [baseChannels, childrenChannelNames] = await getPresentationChannels(id, childrenID);
    const formsState = await createFormStates(id, children, childrenChannelNames);
    applyCustomFormStates(dispatch, id, children);

    const existingChannels = Object.keys(state.channels);
    const channels = await createClientChannels(baseChannels, paramDict, existingChannels);

    paramDict[rootID] = state.parameters[rootID];
    applyChannelsDeps(channels, paramDict);
    await fillChannels(channels, paramDict);

    dispatch(setParamDict(paramDict));
    dispatch(setChannels(channels));
    dispatch(setFormsState(formsState));
    dispatch(fetchFormsEnd(childrenID));
  };
};

function applyCustomFormStates(dispatch: Dispatch, parentID: FormID, data: FormDataWMR[]) {
  for (const { id, type } of data) {
    if (type === 'map') dispatch(createMapState(id, parentID));
    if (type === 'carat') dispatch(createCaratState(id));
  }
}
