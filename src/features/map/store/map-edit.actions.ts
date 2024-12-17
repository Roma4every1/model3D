import type { MapEditState } from '../lib/types';
import { useMapStore } from './map.store';
import { createMapElementInit } from '../lib/map-utils';


export function setMapEditState(id: FormID, edit: Partial<MapEditState>): void {
  const state = useMapStore.getState()[id];
  const newEditState: MapEditState = {...state.edit, ...edit};
  useMapStore.setState({[id]: {...state, edit: newEditState}});
}

export function startMapCreating(id: FormID): void {
  const state = useMapStore.getState()[id];
  const { stage, edit } = state;

  if (edit.creating) return;
  edit.creating = true;

  if (stage.getActiveElement()) {
    stage.clearSelect();
    stage.render();
  }
  stage.setMode('element-create');
  useMapStore.setState({[id]: {...state}});
}

export function startMapEditing(id: FormID): void {
  const state = useMapStore.getState()[id];
  const { stage, edit } = state;

  if (edit.editing || edit.creating) return;
  const mode = stage.getMode();
  const activeElement = stage.getActiveElement();

  edit.editing = true;
  edit.initElement = createMapElementInit(activeElement);

  if (activeElement.type === 'polyline') {
    activeElement.edited = mode.startsWith('line');
  } else {
    activeElement.edited = true;
  }
  stage.render();
  useMapStore.setState({[id]: {...state}});
}

export function acceptMapEditing(id: FormID): void {
  const state = useMapStore.getState()[id];
  const { stage, edit } = state;

  const activeElement = stage.getActiveElement();
  if (!activeElement) return;

  const activeLayer = stage.getActiveElementLayer();
  activeLayer.modified = true;
  stage.clearSelect();
  stage.setMode('default');

  if (!edit.creating) {
    edit.editing = false;
    edit.creating = false;
    edit.initElement = null;
  }
  edit.modified = true;
  stage.render();
  useMapStore.setState({[id]: {...state}});
}

export function cancelMapEditing(id: FormID): void {
  const state = useMapStore.getState()[id];
  const { stage, edit } = state;
  const activeElement = stage.getActiveElement();

  if (!activeElement) {
    if (!edit.creating) return;
    edit.creating = false;
    return stage.setMode('default');
  }
  if (edit.creating) {
    stage.deleteActiveElement();
  } else {
    for (const field in edit.initElement) {
      activeElement[field] = edit.initElement[field];
    }
    edit.initElement = null;
  }
  edit.editing = false;
  edit.creating = false;

  stage.setMode('default');
  stage.clearSelect();
  stage.render();
  useMapStore.setState({[id]: {...state}});
}
