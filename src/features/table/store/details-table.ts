import { createElement } from 'react';
import { showWindow, closeWindow } from 'entities/window';
import { useObjectsStore } from 'entities/objects';
import { useParameterStore } from 'entities/parameter';
import { useChannelStore, updateChannels, updateChannelStore } from 'entities/channel';
import { useTableStore } from './table.store';
import { createTableState } from './table.actions';
import { DetailsTable } from '../components/details-table';

import {
  useClientStore, setClientActiveChild, setClientLoading,
  addSessionClient, createAttachedChannel,
} from 'entities/client';


export function showDetailsTable(formID: FormID, columnID: PropertyName): void {
  const tables = useTableStore.getState();
  const detailsTableID = formID + columnID;
  const detailsTableState = tables[detailsTableID];

  const column = tables[formID]?.columns.dict[columnID];
  if (!column || !column.detailChannel) return;

  const channels = useChannelStore.getState().storage;
  const channel = channels[column.detailChannel];
  const displayName = channel.config.displayName ?? channel.name;

  const presentationID = useClientStore.getState().root.activeChildID;
  const presentation = useClientStore.getState()[presentationID];

  if (presentation.children.every(c => c.id !== detailsTableID)) {
    const formState: SessionClient = {
      id: detailsTableID, parent: presentationID,
      type: 'dataSet', settings: {}, parameters: [],
      channels: [createAttachedChannel({name: channel.name}, channel)],
      neededChannels: getNeededChannels(channel),
      loading: {status: 'done'},
    };
    presentation.children.push({id: detailsTableID, type: 'dataSet', displayName});
    addSessionClient(formState);
  }
  if (!detailsTableState) createTableState({
    state: useClientStore.getState()[detailsTableID],
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
    className: 'details-table-window', style: {zIndex: 99}, width: 400, height: 300,
    resizable: false, title: displayName, onFocus, onClose,
  };

  const content = createElement(DetailsTable, {id: detailsTableID, onClose});
  showWindow(detailsTableID, windowProps, content);
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
  setClientLoading(id, 'data');

  updateChannels(updateDict)
    .then(updateChannelStore)
    .then(() => setClientLoading(id, 'done'));
}
