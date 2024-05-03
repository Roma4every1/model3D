import { t } from 'shared/locales';
import { clientAPI, AttachedChannelFactory, addSessionClients } from 'entities/client';
import { useObjectsStore } from 'entities/objects';
import { createReportModels, setReportModels } from 'entities/report';
import { useChannelStore, fillChannels, setChannels } from 'entities/channel';
import { useParameterStore, addClientParameters, fillParamValues } from 'entities/parameter';
import { applyChannelsDeps } from '../lib/utils';
import { createFormDict, formChannelCriteria } from '../lib/form-dict';
import { setPresentationState } from './presentation.actions';

import {
  createPresentationState, createClientChannels,
  createPresentationChildren, createAttachedChannels,
} from '../lib/initialization';

import {
  fetchingStart, fetchingEnd, fetchingError,
  fetchingStartMany, fetchingEndMany, fetchingErrorMany,
} from 'entities/fetch-state';


/** Инициализация презентации. */
export async function fetchPresentationState(id: ClientID): Promise<void> {
  fetchingStart(id);
  const [presentation, parameters, channelDTOs] = await createPresentationState(id);
  if (!presentation) { fetchingError(id, t('messages.presentation-fetch-error')); return; }

  const parameterState = useParameterStore.getState();
  const paramDict = {[id]: parameters, root: parameterState.root};
  await prepareParameters(presentation, paramDict);
  addClientParameters(id, parameters);

  const reportModels = await createReportModels(id, paramDict);
  setReportModels(id, reportModels);
  setPresentationState(presentation);

  const childIDs = presentation.children.map(child => child.id);
  fetchingStartMany(childIDs);
  fetchingEnd(id);

  const childStates = await createPresentationChildren(id, presentation.children);
  const baseChannels: Set<ChannelName> = new Set(channelDTOs.map(c => c.name));

  for (const childID of childIDs) {
    const channels = childStates[childID]?.channels;
    if (channels) for (const channel of channels) baseChannels.add(channel.name);
  }

  const allChannels = {...useChannelStore.getState()};
  const channels = await createClientChannels(baseChannels, parameters, Object.keys(allChannels));

  for (const name in channels) {
    const channel = channels[name];
    if (channel) allChannels[name] = channel;
  }
  applyChannelsDeps(allChannels, paramDict);

  const attachedChannels = createAttachedChannels(presentation, channelDTOs, allChannels);
  if (attachedChannels.length) {
    setPresentationState({...presentation, channels: attachedChannels});
  }

  const successForms: FormID[] = [];
  const errorForms: {id: FormID, details: string}[] = [];
  const objects = useObjectsStore.getState();

  for (const childID of childIDs) {
    const client: SessionClient = childStates[childID];
    if (!client) {
      errorForms.push({id: childID, details: t('messages.form-fetch-error')});
      continue;
    }

    const factory = new AttachedChannelFactory(allChannels, formChannelCriteria[client.type]);
    client.channels = factory.create(client.channels);
    successForms.push(childID);

    const creator = createFormDict[client.type];
    if (creator) creator({
      state: client,
      settings: client.settings,
      objects: objects,
      parameters: {...parameterState, ...paramDict},
      channels: allChannels,
    });
  }

  await fillChannels(channels, paramDict);
  setChannels(channels);
  addSessionClients(childStates);

  fetchingEndMany(successForms);
  fetchingErrorMany(errorForms);
}

/**
 * Если у параметра презентации есть сеттер в `linkedProperties`,
 * выполняется запрос, который устанавливает его значение.
 */
async function prepareParameters(presentation: PresentationState, paramDict: ParamDict): Promise<void> {
  const id = presentation.id;
  const linkedProperties = presentation.settings.linkedProperties;
  if (!linkedProperties) { presentation.settings.linkedProperties = []; return; }

  const localParameters = paramDict[id];
  const setters: ParameterSetter[] = [];
  const parametersToFill: Parameter[] = [];
  const promises: Promise<string>[] = [];

  for (const setter of linkedProperties) {
    const parameter = localParameters.find(p => p.id === setter.parameterToSet);
    if (!parameter) continue;
    setters.push(setter);

    const executeParameters = fillParamValues(setter.parametersToExecute, paramDict, ['root', id]);
    promises.push(clientAPI.executeLinkedProperty(presentation.id, executeParameters, setter.index));
    parametersToFill.push(parameter);

    for (const parameter of executeParameters) {
      if (!parameter.relatedSetters) parameter.relatedSetters = [];
      parameter.relatedSetters.push({clientID: id, ...setter});
    }
  }

  presentation.settings.linkedProperties = setters;
  if (parametersToFill.length === 0) return;

  const values = await Promise.all(promises);
  parametersToFill.forEach((p, i) => {
    p.setValueString(values[i]);
  });
}
