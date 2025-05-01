import { createElement } from 'react';
import { showWindow, closeWindow } from 'entities/window';
import { useObjectsStore } from 'entities/objects';
import { useParameterStore } from 'entities/parameter';
import { useChannelStore, updateChannels, updateChannelStore } from 'entities/channel';
import { useClientStore, setClientActiveChild, addSessionClient, createAttachedChannel } from 'entities/client';
import { useTableStore } from './table.store';
import { createTableState } from './table.actions';
import { DetailsTable } from '../components/details-table';


export function showDetailsWindow(formID: FormID, link: string): void {
  const clientStates = useClientStore.getState();
  const presentation = clientStates[clientStates[formID].parent] as PresentationState;
  const windows = presentation.settings.windows;
  if (windows) windows[link]?.open(formID);
}

export function showDetailsTable(formID: FormID, columnID: PropertyName): void {
  const tables = useTableStore.getState();
  const detailsTableID = formID + columnID;
  const detailsTableState = tables[detailsTableID];

  const column = tables[formID]?.columns.dict[columnID];
  if (!column || !column.detailChannel) return;

  const channels = useChannelStore.getState().storage;
  const channel = channels[column.detailChannel];
  const displayName = channel.config.displayName ?? channel.name;

  let client: SessionClient;
  const presentationID = useClientStore.getState().root.activeChildID;
  const presentation = useClientStore.getState()[presentationID];

  if (presentation.children.every(c => c.id !== detailsTableID)) {
    client = {
      id: detailsTableID, parent: presentationID,
      type: 'dataSet', settings: {}, parameters: [],
      channels: [createAttachedChannel({name: channel.name}, channel)],
      neededChannels: getNeededChannels(channel),
      loading: {status: 'done'},
    };
    presentation.children.push({id: detailsTableID, type: 'dataSet', displayName});
    addSessionClient(client);
  } else {
    client = useClientStore.getState()[detailsTableID];
  }

  if (!detailsTableState) createTableState({
    state: client,
    objects: useObjectsStore.getState(),
    parameters: useParameterStore.getState().clients,
    channels: channels,
  });

  presentation.openedChildren.add(detailsTableID);
  updateDetailsTable(detailsTableID);

  const onFocus = () => {
    setClientActiveChild(presentationID, detailsTableID);
  };
  const onClose = () => {
    presentation.openedChildren.delete(detailsTableID);
    setClientActiveChild(presentationID, formID);
    closeWindow(detailsTableID);
  };
  const windowProps = {
    className: 'details-table-window', style: {zIndex: 99},
    initialWidth: 400, initialHeight: 300, resizable: true,
    title: displayName, onFocus, onClose,
  };

  const props = {id: detailsTableID, channels: client.neededChannels, onClose};
  showWindow(detailsTableID, windowProps, createElement(DetailsTable, props));
  setClientActiveChild(presentationID, detailsTableID);
}

function getNeededChannels(channel: Channel): ChannelID[] {
  const result = new Set<ChannelID>();
  result.add(channel.id);

  for (const property of channel.config.properties) {
    for (const lookup of property.lookupChannels) result.add(lookup);
  }
  return [...result];
}

function updateDetailsTable(id: ClientID): void {
  const client = useClientStore.getState()[id];
  const channels = useChannelStore.getState().storage;

  let needUpdate = false;
  const updateDict: ChannelDict = {};

  for (const id of client.neededChannels) {
    const channel = channels[id];
    if (!channel.actual) { updateDict[id] = channel; needUpdate = true; }
  }
  if (!needUpdate) return;
  updateChannels(updateDict).then(updateChannelStore);
}
