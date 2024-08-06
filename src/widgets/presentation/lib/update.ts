import { useClientStore } from 'entities/client';
import { useParameterStore } from 'entities/parameter';
import { useProgramStore, updatePrograms } from 'entities/program';
import { useChannelStore, setChannels, fillChannels } from 'entities/channel';


/**
 * Обновление данных, необходимых для показа презентации:
 * + актуализация данных в каналах
 * + актуализация доступности программ и отчётов
 */
export async function updateActivePresentation(lock: boolean = true): Promise<void> {
  const clientStates = useClientStore.getState();
  const root = clientStates.root;
  const activeID = root.activeChildID;
  const presentation = clientStates[activeID];
  if (!presentation || presentation.loading.status !== 'done') return;

  const channels = getChannelsToUpdate(root.neededChannels, presentation.neededChannels);
  const programs = getProgramsToUpdate(activeID);

  const actions: Promise<any>[] = [];
  if (channels) actions.push(fillChannels(channels, useParameterStore.getState().storage))
  if (programs) actions.push(updatePrograms(activeID, programs));
  if (actions.length === 0) return;

  if (lock) togglePresentation(presentation, clientStates, true);
  await Promise.all(actions);
  if (channels) setChannels(channels);
  if (lock) togglePresentation(presentation, clientStates, false);
}

function getChannelsToUpdate(rootIDs: ChannelID[], ids: ChannelID[]): ChannelDict | null {
  let empty = true;
  const dict: ChannelDict = {};
  const storage = useChannelStore.getState().storage;

  for (const id of rootIDs) {
    if (Object.hasOwn(dict, id)) continue;
    const channel = storage[id];
    if (!channel.actual) { dict[id] = channel; empty = false; }
  }
  for (const id of ids) {
    if (Object.hasOwn(dict, id)) continue;
    const channel = storage[id];
    if (!channel.actual) { dict[id] = channel; empty = false; }
  }
  return empty ? null : dict;
}

function getProgramsToUpdate(client: ClientID): Program[] | null {
  const allModels = useProgramStore.getState().models;
  const models = allModels[client].filter(r => r.available === undefined);
  return models.length ? models : null;
}

/* --- --- */

export function lockActivePresentation(): void {
  const clientStates = useClientStore.getState();
  const presentation = clientStates[clientStates.root.activeChildID];
  if (!presentation || presentation.loading.status !== 'done') return;
  togglePresentation(presentation, clientStates, true);
}

export function unlockActivePresentation(): void {
  const clientStates = useClientStore.getState();
  const presentation = clientStates[clientStates.root.activeChildID];
  if (!presentation || presentation.loading.status !== 'done') return;
  togglePresentation(presentation, clientStates, false);
}

function togglePresentation(p: SessionClient, clients: ClientStates, lock: boolean): void {
  let checkStatus: ClientLoadingStatus;
  let targetStatus: ClientLoadingStatus;

  if (lock) {
    checkStatus = 'done';
    targetStatus = 'data';
  } else {
    checkStatus = 'data';
    targetStatus = 'done';
  }

  let changed = false;
  for (const id of p.openedChildren) {
    const client = clients[id];
    if (client?.loading.status !== checkStatus) continue;
    client.loading.status = targetStatus;
    clients[id] = {...client}; changed = true;
  }
  if (changed) useClientStore.setState({...clients}, true);
}
