import { Dispatch } from 'redux';
import { StateGetter, Thunk } from 'shared/lib';
import { createReportModels, setReportModels } from 'entities/reports';
import { fillChannels, setChannels } from 'entities/channels';
import { getPresentationChannels } from '../lib/initialization';
import { createPresentationState, createClientChannels, createFormStates } from '../lib/initialization';
import { applyChannelsDeps } from '../lib/utils';
import { createFormDict } from '../lib/form-dict';
import { formsAPI } from '../lib/forms.api';

import { setParamDict } from 'entities/parameters';
import { fetchFormsStart, fetchFormsEnd, fetchFormError } from 'entities/fetch-state';
import { setPresentationState } from './presentation.actions';
import { setFormsState } from 'widgets/presentation/store/form.actions';


/** Инициализация презентации. */
export const fetchPresentationState = (id: ClientID): Thunk => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    dispatch(fetchFormsStart([id]));

    const presentation = await createPresentationState(id);
    if (!presentation) {
      dispatch(fetchFormError(id, 'ошибка при инициализации презентации'));
      return;
    }

    const childrenID = presentation.children.map(child => child.id);
    const presentationParameters = await formsAPI.getClientParameters(id);
    const paramDict = {[id]: presentationParameters};
    dispatch(setParamDict(paramDict));

    const state = getState();
    const rootID = state.root.id;

    const reportParamDict = {[rootID]: state.parameters[rootID], [id]: presentationParameters};
    const reportModels = await createReportModels(reportParamDict, rootID, id);

    dispatch(fetchFormsStart(childrenID));
    dispatch(setReportModels(id, reportModels));
    dispatch(setPresentationState(presentation));
    dispatch(fetchFormsEnd([id]));

    const [baseChannels, childrenChannelNames] = await getPresentationChannels(id, childrenID);
    const formStates = await createFormStates(id, presentation.children, childrenChannelNames);

    const existingChannels = Object.keys(state.channels);
    const channels = await createClientChannels(baseChannels, paramDict, existingChannels);

    const channelErrors = Object.entries(channels).filter(e => !e[1]).map(e => e[0]);
    if (channelErrors.length > 0) {
      const message = channelErrors.length === 1
        ? `Ошибка при инициализации канала ${channelErrors[0]}`
        : `Ошибка при инициализации каналов ${channelErrors.join(', ')}`;
      dispatch(fetchFormError(id, message));
      dispatch(fetchFormsEnd(childrenID)); return;
    }

    const allChannels = {...state.channels, ...channels};
    paramDict[rootID] = state.parameters[rootID];
    applyChannelsDeps(allChannels, paramDict);

    for (const id of childrenID) {
      const formState = formStates[id];
      const creator = createFormDict[formState.type];
      if (!creator) continue;

      const payload: FormStatePayload = {
        state: formStates[id],
        settings: formStates[id].settings,
        objects: state.objects,
        parameters: {...state.parameters, ...paramDict},
        channels: allChannels,
      };
      dispatch(creator(payload));
    }

    await fillChannels(channels, paramDict);
    dispatch(setChannels(channels));
    dispatch(setFormsState(formStates));
    dispatch(fetchFormsEnd(childrenID));
  };
};
