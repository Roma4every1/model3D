import { MapModes } from "../../components/forms/Map/enums";
import { chunk } from "lodash";
import { getParentFormId } from "../../utils";
import { getBoundsByPoints, getMultiMapChildrenCanvases } from "../../components/forms/Map/map-utils";

/* --- actions types --- */

export enum MapsActions {
  ADD_MULTI_MAP = 'maps/add_multi',
  SET_SYNC = 'maps/sync',
  ADD = 'maps/add',
  LOAD_SUCCESS = 'maps/loadOk',
  LOAD_ERROR = 'maps/loadErr',
  START_LOAD = 'maps/start_load',
  SET_MODE = 'maps/setMode',
  SET_DRAW_END = 'maps/setEnd',
  SET_FIELD = 'maps/setField',
  CLEAR_SELECT = 'maps/clear',
  START_EDITING = 'maps/startEdit',
  ACCEPT_EDITING = 'maps/acceptEdit',
  CANCEL_EDITING = 'maps/cancelEdit',
  START_CREATING = 'maps/startCreate',
  CREATE_ELEMENT = 'maps/createEl',
  CANCEL_CREATING = 'maps/cancelCreate'
}

/* --- actions interfaces --- */

interface MapAction {
  type: MapsActions,
  formID: FormID,
}

interface ActionAddMulti extends MapAction {
  type: MapsActions.ADD_MULTI_MAP,
  payload: FormID[],
}
interface ActionSetSync extends MapAction {
  type: MapsActions.SET_SYNC,
  payload: boolean,
}

interface ActionAdd extends MapAction {
  type: MapsActions.ADD,
  drawer: MapsDrawer,
}
interface ActionLoadSuccess extends MapAction {
  type: MapsActions.LOAD_SUCCESS,
  mapData: MapData,
}
interface ActionLoadError extends MapAction {
  type: MapsActions.LOAD_ERROR,
}
interface ActionStartLoad extends MapAction {
  type: MapsActions.START_LOAD,
}
interface ActionSetMode extends MapAction {
  type: MapsActions.SET_MODE,
  payload: MapModes,
}
interface ActionSetDimensions extends MapAction {
  type: MapsActions.SET_DRAW_END,
  payload: (canvas: MapCanvas, x: number, y: number, scale: number) => void,
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
interface ActionCancelCreating extends MapAction {
  type: MapsActions.CANCEL_CREATING,
}

export type MapsAction = ActionAddMulti | ActionSetSync | ActionAdd |
  ActionStartLoad | ActionLoadSuccess | ActionLoadError |
  ActionSetMode | ActionSetDimensions | ActionSetField | ActionClearSelect |
  ActionStartEditing | ActionAcceptEditing | ActionCancelEditing |
  ActionStartCreating | ActionCreateElement | ActionCancelCreating;

/* --- utils --- */

const getDefaultSelecting = (): MapSelectingState => {
  return {nearestElements: [], activeIndex: 0, lastPoint: null}
};

const clearOldData = (mapState: MapState): void => {
  mapState.oldData.x = null;
  mapState.oldData.y = null;
  mapState.oldData.arc = null;
}

const clearSelect = (mapState: MapState): void => {
  if (mapState.element) {
    mapState.element.edited = false;
    mapState.element.selected = false;
    mapState.element = null;
  }
  mapState.isElementEditing = false;

  clearOldData(mapState);
}

const setMultiMapBlocked = (state: MapsState, parentFormID: FormID, blocked: boolean): void => {
  state.multi[parentFormID].children.forEach((formID) => {
    state.single[formID].canvas.blocked = blocked;
  });
}

const initMapState: MapState = {
  mode: MapModes.NONE,
  legends: {loaded: false, success: undefined, data: null},
  mapData: null,
  activeLayer: null,
  isLoadSuccessfully: undefined,
  canvas: null,
  drawer: null,
  owner: null,
  mapID: null,
  element: null,
  isElementEditing: false,
  oldData: {x: null, y: null, arc: null, ange: null},
  selecting: getDefaultSelecting(),
  isModified: false,
  cursor: 'auto',
  childOf: null, scroller: null,
  utils: { updateCanvas: () => {}, pointToMap: (point) => point },
};

const initMaps: MapsState = {multi: {}, single: {}};

/* --- reducer --- */

export const mapsReducer = (state: MapsState = initMaps, action: MapsAction): MapsState => {
  switch (action.type) {

    /* --- multi --- */

    case MapsActions.ADD_MULTI_MAP: {
      if (state.multi[action.formID]) return state;
      state.multi[action.formID] = {sync: true, children: action.payload};
      return {...state};
    }

    case MapsActions.SET_SYNC: {
      state.multi[action.formID] = {...state.multi[action.formID], sync: action.payload};
      const children = state.multi[action.formID].children;
      if (action.payload === false) {
        children.forEach((formID: FormID) => { state.single[formID]?.scroller?.setList([]); });
      } else {
        children.forEach((formID: FormID) => {
          const canvases = getMultiMapChildrenCanvases(state.multi, state.single, formID);
          state.single[formID]?.scroller?.setList(canvases);
        });
      }
      return {...state};
    }

    /* --- single --- */

    case MapsActions.ADD: {
      const parentFormID = getParentFormId(action.formID);
      const childOf = state.multi[parentFormID] ? parentFormID : null;
      const utils = { updateCanvas: () => {}, pointToMap: (point) => point };
      state.single[action.formID] = {...initMapState, utils, childOf, drawer: action.drawer};
      return {...state, single: {...state.single}};
    }

    case MapsActions.START_LOAD: {
      const formID = action.formID;
      state.single[formID] = {...state.single[formID], mapData: null, isLoadSuccessfully: undefined};
      return {...state};
    }

    case MapsActions.LOAD_SUCCESS: {
      const { formID, mapData } = action;
      if (!mapData.onDrawEnd) mapData.onDrawEnd = () => {};
      state.single[formID] = {...state.single[formID], mapData, isLoadSuccessfully: true};
      return {...state};
    }

    case MapsActions.LOAD_ERROR: {
      state.single[action.formID] = {...state.single[action.formID], isLoadSuccessfully: true};
      return {...state};
    }

    case MapsActions.SET_MODE: {
      const { formID, payload: mode } = action;
      const newMapState: MapState = {...state.single[formID]};
      newMapState.mode = mode;
      newMapState.cursor = mode === MapModes.AWAIT_POINT ? 'crosshair' : 'auto';

      const isEditing = mode > MapModes.MOVE_MAP;
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

    case MapsActions.SET_DRAW_END: {
      const { formID, payload } = action;
      state.single[formID].mapData.onDrawEnd = payload;
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

      clearOldData(newMapState);
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
      const element = newMapState.element;

      if (element.type === 'polyline') {
        const arc = element.arcs[0];
        newMapState.oldData.arc = {closed: arc.closed, path: [...arc.path]};
      }
      if (element.type === 'label') {
        newMapState.oldData.x = element.x;
        newMapState.oldData.y = element.y;
        newMapState.oldData.ange = element.angle;
      }
      if (element.type === 'sign') {
        newMapState.oldData.x = element.x;
        newMapState.oldData.y = element.y;
      }

      state.single[action.formID] = newMapState;
      return {...state};
    }

    case MapsActions.ACCEPT_EDITING: {
      const newMapState: MapState = {...state.single[action.formID]};
      const element = newMapState.element;

      clearSelect(newMapState);
      newMapState.mode = MapModes.NONE;
      newMapState.childOf
        ? setMultiMapBlocked(state, newMapState.childOf, false)
        : newMapState.canvas.blocked = false;

      if (element.type === 'polyline') {
        element.bounds = getBoundsByPoints(chunk(element.arcs[0].path, 2));
      }
      const modifiedLayer = newMapState.mapData.layers?.find(l => l.elements?.includes(element));
      if (modifiedLayer) {
        modifiedLayer.modified = true;
        newMapState.isModified = true;
      }

      newMapState.utils.updateCanvas();
      state.single[action.formID] = newMapState;
      return {...state};
    }

    case MapsActions.CANCEL_EDITING: {
      const newMapState: MapState = {...state.single[action.formID]};
      const element = newMapState.element;
      const oldData = newMapState.oldData;

      if (element) {
        if (element.type === 'polyline') {
          element.arcs[0] = oldData.arc;
        }
        if (element.type === 'label') {
          element.x = oldData.x;
          element.y = oldData.y;
          element.angle = oldData.ange;
        }
        if (element.type === 'sign') {
          element.x = oldData.x;
          element.y = oldData.y;
        }
        element.edited = false;
      }
      clearOldData(newMapState);

      newMapState.childOf
        ? setMultiMapBlocked(state, newMapState.childOf, false)
        : newMapState.canvas.blocked = false;
      newMapState.isElementEditing = false;
      newMapState.mode = MapModes.NONE;
      newMapState.utils.updateCanvas();
      state.single[action.formID] = newMapState;
      return {...state};
    }

    case MapsActions.START_CREATING: {
      const newMapState: MapState = {...state.single[action.formID]};
      clearSelect(newMapState);
      newMapState.mode = MapModes.CREATING;
      newMapState.utils.updateCanvas();
      state.single[action.formID] = newMapState;
      return {...state};
    }

    case MapsActions.CREATE_ELEMENT: {
      const newMapState = {...state.single[action.formID]};
      newMapState.element = action.payload;
      newMapState.element.edited = true;
      newMapState.isElementEditing = true;

      newMapState.activeLayer.elements.push(action.payload);
      newMapState.activeLayer.modified = true;
      newMapState.isModified = true;

      newMapState.childOf
        ? setMultiMapBlocked(state, newMapState.childOf, false)
        : newMapState.canvas.blocked = false;

      const isPolyline = newMapState.element.type === 'polyline';
      newMapState.mode = isPolyline ? MapModes.ADD_END : MapModes.MOVE_MAP;
      newMapState.canvas.blocked = isPolyline;

      newMapState.cursor = 'auto';
      newMapState.utils.updateCanvas();
      state.single[action.formID] = newMapState;
      return {...state};
    }

    case MapsActions.CANCEL_CREATING: {
      const newMapState: MapState = {...state.single[action.formID]};
      clearSelect(newMapState);
      newMapState.mode = MapModes.NONE;
      newMapState.utils.updateCanvas();
      state.single[action.formID] = newMapState;
      return {...state};
    }

    default: return state;
  }
}
