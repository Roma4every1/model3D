import type { WindowProps } from '@progress/kendo-react-dialogs';
import { createElement } from 'react';
import { showWindow, closeWindow } from 'entities/window';
import { useClientStore, setClientActiveChild } from 'entities/client';
import { useChannelStore, updateChannels, updateChannelStore } from 'entities/channel';
import { PresentationWindowView } from '../components/presentation-window';


export function showPresentationWindow(id: ClientID, name: string, initiator?: ClientID): void {
  const windowID: WindowID = id + '::' + name;
  const presentation = useClientStore.getState()[id] as PresentationState;
  const { settings, formIDs, layout } = presentation.settings.windows[name];

  formIDs.forEach(id => presentation.openedChildren.add(id));
  updateClients(formIDs);

  const windowProps = getWindowProps(settings);
  windowProps.onClose = () => {
    formIDs.forEach(id => presentation.openedChildren.delete(id));
    if (initiator) setClientActiveChild(id, initiator);
    closeWindow(windowID);
  };
  const content = createElement(PresentationWindowView, {id, layout});
  showWindow(windowID, windowProps, content);
}

function getWindowProps(s: PresentationWindowSettings): WindowProps {
  let width = toPixels(s.width, window.innerWidth);
  const minWidth = toPixels(s.minWidth, window.innerWidth);
  if (width && minWidth && width < minWidth) width = minWidth;

  let height = toPixels(s.height, window.innerHeight);
  const minHeight = toPixels(s.minHeight, window.innerHeight);
  if (height && minHeight && height < minHeight) height = minHeight;

  return {
    title: s.title, resizable: s.resizable, style: {zIndex: 90},
    initialWidth: width, minWidth,
    initialHeight: height, minHeight,
  };
}

function toPixels(value: string, base: number): number | undefined {
  if (!value) return undefined;
  let n = Number.parseInt(value);
  if (value.endsWith('%')) n = Math.round(n / 100 * base);
  return n;
}

function updateClients(ids: Iterable<ClientID>): void {
  const clients = useClientStore.getState();
  const channels = useChannelStore.getState().storage;

  let needUpdate = false;
  const updateDict: ChannelDict = {};

  for (const clientID of ids) {
    for (const id of clients[clientID].neededChannels) {
      const channel = channels[id];
      if (!channel.actual) { updateDict[id] = channel; needUpdate = true; }
    }
  }
  if (!needUpdate) return;
  updateChannels(updateDict).then(updateChannelStore);
}
