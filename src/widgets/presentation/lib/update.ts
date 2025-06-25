import { useClientStore } from 'entities/client';
import { useProgramStore, updatePrograms } from 'entities/program';
import { useChannelStore, updateChannels, updateChannelStore } from 'entities/channel';
import { calcClientChildren } from './layout-utils';


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

  const clientsToUpdate: SessionClient[] = [root, presentation];
  for (const id of presentation.openedChildren) {
    const client = clientStates[id];
    if (client) clientsToUpdate.push(client);
  }
  const channels = getChannelsToUpdate(clientsToUpdate);
  const programs = getProgramsToUpdate(activeID);

  const actions: Promise<any>[] = [];
  if (channels) actions.push(updateChannels(channels));
  if (programs) actions.push(updatePrograms(activeID, programs));
  if (actions.length === 0) return;

  if (lock) togglePresentation(presentation, clientStates, true);
  await Promise.all(actions);
  if (channels) updateChannelStore();
  if (lock) togglePresentation(presentation, clientStates, false);
}

export function getChannelsToUpdate(clients: SessionClient[]): ChannelDict | null {
  let empty = true;
  const dict: ChannelDict = {};
  const storage = useChannelStore.getState().storage;

  for (const client of clients) {
    for (const id of client.neededChannels) {
      if (Object.hasOwn(dict, id)) continue;
      const channel = storage[id];
      if (!channel.actual) { dict[id] = channel; empty = false; }
    }
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

/* --- --- */

export async function selectPresentationTab(id: ClientID): Promise<void> {
  const clients = useClientStore.getState();
  const presentation = clients[id];

  const { openedChildren, childrenTypes, activeChildID } = calcClientChildren(presentation.layout);
  useClientStore.setState({[id]: {...presentation, openedChildren, childrenTypes, activeChildID}});

  if (presentation.loading.status !== 'done') return;
  const clientsToUpdate = [...openedChildren].map(id => clients[id]);
  const channels = getChannelsToUpdate(clientsToUpdate);
  if (!channels) return;

  clientsToUpdate.forEach(c => { c.loading.status = 'data'; });
  await updateChannels(channels);
  updateChannelStore();
  clientsToUpdate.forEach(c => { c.loading.status = 'done'; });
}
