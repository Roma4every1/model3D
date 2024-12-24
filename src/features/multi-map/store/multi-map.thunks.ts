import { useObjectsStore } from 'entities/objects';
import { useClientStore, setClientChildren } from 'entities/client';
import { useMapStore, setMapStatus, MapStateFactory } from 'features/map';
import { type MultiMapChild, useMultiMapStore } from './multi-map.store';
import { MultiMapChildFactory } from '../lib/factory';
import { getMultiMapLayout } from '../lib/layout';


export async function updateMultiMap(id: ClientID, channelData: ChannelData): Promise<void> {
  const presentation = useClientStore.getState()[id];
  const state = useMultiMapStore.getState()[id];
  const mapStates = useMapStore.getState();
  const objects = useObjectsStore.getState();

  const factory = new MultiMapChildFactory(id, presentation.channels[0].info);
  const children = factory.create(channelData);
  if (children.length === 0 && state?.children.length === 0) return;

  const layout = getMultiMapLayout(children);
  const templateFormID = state?.templateFormID ?? presentation.openedChildren[0];
  const sync = state?.sync ?? true;

  for (const child of children) {
    let mapState = mapStates[child.formID];
    if (mapState) {
      child.loadFlag = true;
    } else {
      mapState = MapStateFactory.createForMultiMap(child.formID, templateFormID, objects);
      mapStates[child.formID] = mapState;
    }
    child.loader = mapState.loader;
    child.stage = mapState.stage;
    child.stage.scroller.sync = sync;
  }

  state?.children?.forEach((oldChild: MultiMapChild) => {
    if (children.some(c => c.id === oldChild.id)) return;
    oldChild.loader.abortLoading();
    delete mapStates[oldChild.formID];
  });

  useMapStore.setState({...mapStates}, true);
  useMultiMapStore.setState({[id]: {templateFormID, layout, sync, children}});
  setClientChildren(id, children.map(c => ({id: c.formID, type: 'map', displayName: ''})));
  await fetchMultiMapData(children);
}

async function fetchMultiMapData(children: MultiMapChild[]): Promise<void> {
  const updateStages = () => {
    for (const child of children) {
      child.stage.scroller.list = children
        .filter(c => c.id !== child.id)
        .map(c => c.stage.getCanvas())
        .filter(Boolean);
    }
  };

  for (const child of children) {
    if (child.loadFlag) continue;
    setMapStatus(child.formID, 'loading');
  }
  for (const child of children) {
    if (child.loadFlag) continue;
    const mapData = await child.loader.loadMapData(child.id, child.storage);

    if (typeof mapData === 'string') {
      setMapStatus(child.formID, 'error');
    } else if (mapData) {
      child.stage.setData(mapData);
      setMapStatus(child.formID, 'ok');
      updateStages();
    }
  }
  setTimeout(updateStages, 100);
}
