import { useClientStore } from 'entities/client';
import { useParameterStore } from 'entities/parameter';
import { useProgramStore, updatePrograms } from 'entities/program';
import { useChannelStore, fillChannels } from 'entities/channel';


/**
 * Обновление данных, необходимых для показа презентации:
 * + актуализация данных в каналах
 * + актуализация доступности программ и отчётов
 */
export async function updateActivePresentation(): Promise<void> {
  const clientStates = useClientStore.getState();
  const root = clientStates.root;
  const activeID = root.activeChildID;
  const presentation = clientStates[activeID];
  if (!presentation || presentation.loading.status !== 'done') return;

  const channels = getChannelsToUpdate(root.neededChannels, presentation.neededChannels);
  const programs = getReportToUpdate(activeID);

  const actions: Promise<any>[] = [];
  if (channels) actions.push(fillChannels(channels, useParameterStore.getState().storage))
  if (programs) actions.push(updatePrograms(activeID, programs));
  if (actions.length === 0) return;

  await Promise.all(actions);
  if (channels) useChannelStore.setState(channels);
}

function getChannelsToUpdate(rootNames: ChannelName[], names: ChannelName[]): ChannelDict | null {
  let empty = true;
  const dict: ChannelDict = {};
  const store = useChannelStore.getState();

  for (const name of rootNames) {
    if (Object.hasOwn(dict, name)) continue;
    const channel = store[name];
    if (!channel.actual) { dict[name] = {...channel}; empty = false; }
  }
  for (const name of names) {
    if (Object.hasOwn(dict, name)) continue;
    const channel = store[name];
    if (!channel.actual) { dict[name] = {...channel}; empty = false; }
  }
  return empty ? null : dict;
}

function getReportToUpdate(client: ClientID): Program[] | null {
  const allModels = useProgramStore.getState().models;
  const models = allModels[client].filter(r => r.available === undefined);
  return models.length ? models : null;
}
