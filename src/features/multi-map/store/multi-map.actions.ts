import { useMultiMapStore } from './multi-map.store';


/** Устанавливает значение параметра синхронизации. */
export function setMultiMapSync(id: ClientID, sync: boolean): void {
  const multiMapState = useMultiMapStore.getState()[id];
  const children = multiMapState.children;
  for (const child of children) child.stage.scroller.sync = sync;

  if (sync && children.length) {
    const stage = children[0].stage;
    const { x, y, scale } = stage.getMapData();
    stage.getCanvas().events.emit('sync', {centerX: x, centerY: y, scale});
  }
  useMultiMapStore.setState({[id]: {...multiMapState, sync}});
}
