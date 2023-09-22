import { MapMode } from '../lib/constants.ts';
import { chunk } from 'lodash';
import { createMapElementInit, getBoundsByPoints, getMultiMapChildrenCanvases } from '../lib/map-utils';
import { traceLayerProto, getTraceMapElement, getFullTraceViewport } from '../lib/traces-map-utils';

/* --- Action Types --- */

export enum MapsActions {
  ADD_MULTI_MAP = 'maps/add_multi',
  SET_SYNC = 'maps/sync',
  ADD = 'maps/add',
  LOAD_SUCCESS = 'maps/loadOk',
  START_LOAD = 'maps/start_load',
  SET_MODE = 'maps/setMode',
  SET_FIELD = 'maps/setField',
  CLEAR_SELECT = 'maps/clear',
  START_EDITING = 'maps/startEdit',
  ACCEPT_EDITING = 'maps/acceptEdit',
  CANCEL_EDITING = 'maps/cancelEdit',
  START_CREATING = 'maps/startCreate',
  CREATE_ELEMENT = 'maps/createEl',
  ACCEPT_CREATING = 'maps/acceptCreate',
  CANCEL_CREATING = 'maps/cancelCreate',
  SET_TRACE = 'maps/trace',
}

/* --- Action Interfaces --- */

interface MapAction {
  type: MapsActions;
  formID: FormID;
}

interface ActionAddMulti {
  type: MapsActions.ADD_MULTI_MAP;
  payload: {id: ClientID, configs: MapItemConfig[], templateFormID: FormID};
}
interface ActionSetSync {
  type: MapsActions.SET_SYNC;
  payload: {id: ClientID, sync: boolean};
}

interface ActionCreate {
  type: MapsActions.ADD,
  payload: FormStatePayload,
}
interface ActionLoadSuccess extends MapAction {
  type: MapsActions.LOAD_SUCCESS,
  mapData: MapData,
}
interface ActionStartLoad extends MapAction {
  type: MapsActions.START_LOAD,
}
interface ActionSetMode extends MapAction {
  type: MapsActions.SET_MODE,
  payload: MapMode,
}
interface ActionSetField extends MapAction {
  type: MapsActions.SET_FIELD,
  field: keyof MapState;
  payload: any,
}
interface ActionClearSelect extends MapAction {
  type: MapsActions.CLEAR_SELECT,
  elementOnly: boolean,
}
interface ActionStartEditing extends MapAction {
  type: MapsActions.START_EDITING,
}
interface ActionAcceptEditing extends MapAction {
  type: MapsActions.ACCEPT_EDITING,
}
interface ActionCancelEditing extends MapAction {
  type: MapsActions.CANCEL_EDITING,
}
interface ActionStartCreating extends MapAction {
  type: MapsActions.START_CREATING,
}
interface ActionCreateElement extends MapAction {
  type: MapsActions.CREATE_ELEMENT,
  payload: MapElement,
}
interface ActionAcceptCreating extends MapAction {
  type: MapsActions.ACCEPT_CREATING,
}
interface ActionCancelCreating extends MapAction {
  type: MapsActions.CANCEL_CREATING,
}
interface ActionSetTrace extends MapAction {
  type: MapsActions.SET_TRACE,
  model: TraceModel, updateViewport: boolean,
}


export type MapsAction = ActionAddMulti | ActionSetSync | ActionCreate |
  ActionStartLoad | ActionLoadSuccess | ActionSetMode | ActionSetField | ActionClearSelect |
  ActionStartEditing | ActionAcceptEditing | ActionCancelEditing |
  ActionStartCreating | ActionCreateElement | ActionCancelCreating | ActionAcceptCreating |
  ActionSetTrace;

/* --- Reducer Utils --- */

const clearSelect = (mapState: MapState): void => {
  if (mapState.element) {
    mapState.element.edited = false;
    mapState.element.selected = false;
    mapState.element = null;
  }
  mapState.isElementEditing = false;
};

const setMultiMapBlocked = (state: MapsState, parentFormID: FormID, blocked: boolean): void => {
  state.multi[parentFormID].children.forEach((formID) => {
    state.single[formID].canvas.blocked = blocked;
  });
};

const initMapState: MapState = {
  mode: MapMode.NONE,
  mapData: null,
  activeLayer: null,
  isLoadSuccessfully: undefined,
  canvas: null,
  owner: null,
  mapID: null,
  element: null,
  elementInit: null,
  elementInitProperties: null,
  isElementEditing: false,
  isElementCreating: false,
  selecting: {nearestElements: [], activeIndex: 0, lastPoint: null},
  isModified: false,
  cursor: 'auto',
  childOf: null, scroller: null,
  utils: { updateCanvas: () => {}, pointToMap: (point) => point },
};

/* --- Init State & Reducer --- */

const init: MapsState = {multi: {}, single: {}};

export const mapsReducer = (state: MapsState = init, action: MapsAction): MapsState => {
  switch (action.type) {

    /* --- multi --- */

    case MapsActions.ADD_MULTI_MAP: {
      const { id, configs } = action.payload;
      const oldState = state.multi[id];
      const sync = oldState?.sync ?? true;
      const templateFormID = oldState?.templateFormID ?? action.payload.templateFormID;
      state.multi[id] = {sync, templateFormID, configs, children: configs.map(c => c.formID)};

      for (const { formID } of configs) {
        const utils = { updateCanvas: () => {}, pointToMap: (point) => point };
        state.single[formID] = {...initMapState, utils, childOf: id};
      }
      return {...state};
    }

    case MapsActions.SET_SYNC: {
      const { id: parentID, sync } = action.payload;
      state.multi[parentID] = {...state.multi[parentID], sync};
      const children = state.multi[parentID].children;

      if (sync === false) {
        children.forEach((childID: FormID) => {
          state.single[childID]?.scroller?.setList([]);
        });
      } else {
        children.forEach((childID: FormID) => {
          const canvases = getMultiMapChildrenCanvases(state.multi, state.single, childID, parentID);
          state.single[childID]?.scroller?.setList(canvases);
        });
      }
      return {...state};
    }

    /* --- single --- */

    case MapsActions.ADD: {
      const { id, parent } = action.payload.state;
      const childOf = state.multi[parent] ? parent : null;
      const utils = { updateCanvas: () => {}, pointToMap: (point) => point };
      state.single[id] = {...initMapState, utils, childOf};
      return {...state, single: {...state.single}};
    }

    case MapsActions.START_LOAD: {
      const formID = action.formID;
      state.single[formID] = {...state.single[formID], mapData: null, isLoadSuccessfully: undefined};
      return {...state};
    }

    case MapsActions.LOAD_SUCCESS: {
      const { formID, mapData } = action;
      mapData.layers.forEach(l => l.elementType = l.elements[0]?.type ?? 'sign');
      state.single[formID] = {...state.single[formID], mapData, isLoadSuccessfully: true};
      return {...state};
    }

    case MapsActions.SET_MODE: {
      const { formID, payload: mode } = action;
      const newMapState: MapState = {...state.single[formID]};
      newMapState.mode = mode;
      newMapState.cursor = mode === MapMode.AWAIT_POINT ? 'crosshair' : 'auto';

      const isEditing = mode > MapMode.MOVE_MAP;
      newMapState.childOf
        ? setMultiMapBlocked(state, newMapState.childOf, isEditing)
        : newMapState.canvas.blocked = isEditing;

      if (newMapState.element) {
        newMapState.isElementEditing = isEditing;
        newMapState.element.edited = isEditing;
        newMapState.utils.updateCanvas();
      }
      state.single[formID] = newMapState;
      return {...state};
    }

    case MapsActions.SET_FIELD: {
      const { formID, field, payload } = action;
      state.single[formID] = {...state.single[formID], [field]: payload};
      return {...state};
    }

    case MapsActions.CLEAR_SELECT: {
      const { formID, elementOnly } = action;
      const newMapState: MapState = {...state.single[formID]};

      newMapState.childOf
        ? setMultiMapBlocked(state, newMapState.childOf, false)
        : newMapState.canvas.blocked = false;
      newMapState.isElementEditing = false;

      if (newMapState.element) {
        newMapState.element.edited = false;
        newMapState.element = null;
      }
      if (!elementOnly) {
        newMapState.selecting = {nearestElements: [], activeIndex: 0, lastPoint: null};
        newMapState.cursor = 'auto';
      }

      state.single[formID] = newMapState;
      return {...state};
    }

    case MapsActions.START_EDITING: {
      const newMapState: MapState = {...state.single[action.formID]};
      newMapState.elementInit = createMapElementInit(newMapState.element);
      state.single[action.formID] = newMapState;
      return {...state};
    }

    case MapsActions.ACCEPT_EDITING: {
      const newMapState: MapState = {...state.single[action.formID]};
      const element = newMapState.element;

      clearSelect(newMapState);
      newMapState.mode = MapMode.NONE;
      newMapState.childOf
        ? setMultiMapBlocked(state, newMapState.childOf, false)
        : newMapState.canvas.blocked = false;

      const modifiedLayer = newMapState.mapData.layers?.find(l => l.elements?.includes(element));
      if (modifiedLayer) {
        modifiedLayer.modified = true;
        newMapState.isModified = true;
      }

      if (element.type === 'polyline') {
        element.bounds = getBoundsByPoints(chunk(element.arcs[0].path, 2) as [number, number][]);
        newMapState.isModified = !(element as MapPolyline)?.isTrace;
      }

      newMapState.utils.updateCanvas();
      state.single[action.formID] = newMapState;
      return {...state};
    }

    case MapsActions.CANCEL_EDITING: {
      const newMapState: MapState = {...state.single[action.formID]};
      for (const field in newMapState.elementInit) {
        newMapState.element[field] = newMapState.elementInit[field];
      }

      newMapState.childOf
        ? setMultiMapBlocked(state, newMapState.childOf, false)
        : newMapState.canvas.blocked = false;
      newMapState.isElementEditing = false;
      newMapState.mode = MapMode.NONE;
      newMapState.utils.updateCanvas();
      state.single[action.formID] = newMapState;
      return {...state};
    }

    case MapsActions.START_CREATING: {
      const newMapState: MapState = {...state.single[action.formID]};
      clearSelect(newMapState);
      newMapState.mode = MapMode.CREATING;
      newMapState.isElementCreating = true;
      newMapState.utils.updateCanvas();
      state.single[action.formID] = newMapState;
      return {...state};
    }

    case MapsActions.CREATE_ELEMENT: {
      const newMapState = {...state.single[action.formID]};
      newMapState.element = action.payload;

      newMapState.isElementEditing = true;
      newMapState.activeLayer.elements.push(action.payload);

      newMapState.childOf
        ? setMultiMapBlocked(state, newMapState.childOf, false)
        : newMapState.canvas.blocked = false;

      const isPolyline = newMapState.element.type === 'polyline';
      newMapState.mode = isPolyline ? MapMode.ADD_END : MapMode.MOVE_MAP;
      newMapState.canvas.blocked = isPolyline;
      newMapState.isModified = !(isPolyline && (newMapState.element as MapPolyline)?.isTrace);

      newMapState.cursor = 'auto';
      newMapState.utils.updateCanvas();
      state.single[action.formID] = newMapState;
      return {...state};
    }

    case MapsActions.ACCEPT_CREATING: {
      const newMapState: MapState = {...state.single[action.formID]};

      newMapState.isElementCreating = false;
      newMapState.isElementEditing = false;

      newMapState.activeLayer.modified = true;
      newMapState.isModified = true;

      newMapState.childOf
        ? setMultiMapBlocked(state, newMapState.childOf, false)
        : newMapState.canvas.blocked = false;
      newMapState.mode = MapMode.NONE;
      newMapState.utils.updateCanvas();
      state.single[action.formID] = newMapState;
      return {...state};
    }

    case MapsActions.CANCEL_CREATING: {
      const newMapState: MapState = {...state.single[action.formID]};

      newMapState.isElementCreating = false;
      newMapState.isElementEditing = false;
      clearSelect(newMapState);

      newMapState.activeLayer.elements.pop();

      newMapState.cursor = 'auto';
      newMapState.childOf
        ? setMultiMapBlocked(state, newMapState.childOf, false)
        : newMapState.canvas.blocked = false;
      newMapState.mode = MapMode.NONE;
      newMapState.cursor = 'auto';
      state.single[action.formID] = newMapState;
      return {...state};
    }

    case MapsActions.SET_TRACE: {
      const { formID, model, updateViewport } = action;
      const mapState = state.single[formID];
      const layers = mapState?.mapData?.layers;
      if (!layers) return state;

      let traceElement: MapPolyline;
      let traceLayer = layers.find(layer => layer.uid === '{TRACES-LAYER}');

      if (!traceLayer) {
        traceLayer = structuredClone(traceLayerProto);
        mapState.mapData.layers = [...layers, traceLayer];
      }

      if (!model || !model.nodes.length) {
        traceLayer.elements = [];
      } else {
        traceElement = getTraceMapElement(model);
        traceLayer.elements = [traceElement];
        traceLayer.bounds = traceElement.bounds;
      }

      const viewport = traceElement && updateViewport
        ? getFullTraceViewport(traceElement, mapState.canvas)
        : undefined;
      mapState.utils.updateCanvas(viewport);
      return {...state};
    }

    default: return state;
  }
};
