import { t } from 'shared/locales';
import { clientAPI, AttachedChannelFactory, addSessionClients } from 'entities/client';
import { useObjectsStore } from 'entities/objects';
import { createReportModels, setReportModels } from 'entities/report';
import { useChannelStore, fillChannels, setChannels } from 'entities/channel';
import { useParameterStore, addClientParameters, fillParamValues } from 'entities/parameter';
import { clientFetchingStart, clientFetchingEnd, clientFetchingError } from 'entities/fetch-state';

import { createPresentationState, createClientChannels, createPresentationChildren } from '../lib/initialization';
import { applyChannelsDeps } from '../lib/utils';
import { createFormDict } from '../lib/form-dict';
import { setPresentationState } from './presentation.actions';


/** Инициализация презентации. */
export async function fetchPresentationState(id: ClientID): Promise<void> {
  clientFetchingStart(id);
  const [presentation, parameters, attachedChannels] = await createPresentationState(id);
  if (!presentation) {
    clientFetchingError([{id, details: t('messages.presentation-fetch-error')}]);
    return;
  }

  const parameterState = useParameterStore.getState();
  const paramDict = {[id]: parameters, root: parameterState.root};
  await prepareParameters(presentation, paramDict);
  addClientParameters(id, parameters);

  const reportModels = await createReportModels(paramDict, 'root', id);
  setReportModels(id, reportModels);
  setPresentationState(presentation);

  const childIDs = presentation.children.map(child => child.id);
  clientFetchingStart(childIDs);
  clientFetchingEnd(id);

  const childStates = await createPresentationChildren(id, presentation.children);
  const baseChannels: Set<ChannelName> = new Set(attachedChannels.map(c => c.name));

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

  const successForms: FormID[] = [];
  const errorForms: {id: FormID, details: string}[] = [];
  const objects = useObjectsStore.getState();

  for (const childID of childIDs) {
    const client: SessionClient = childStates[childID];
    if (!client) {
      errorForms.push({id: childID, details: t('messages.form-fetch-error')});
      continue;
    }
    client.channels = new AttachedChannelFactory(allChannels).createModels(client.channels);
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

  clientFetchingEnd(successForms);
  clientFetchingError(errorForms);
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
