import {MapModes} from "../../components/forms/Map/enums";
import {chunk} from "lodash";
import {getBoundsByPoints} from "../../components/forms/Map/map-utils";

/* --- actions types --- */

export enum MapsActions {
  ADD = 'maps/add',
  LOAD_SUCCESS = 'maps/loadOk',
  LOAD_ERROR = 'maps/loadErr',
  START_LOAD = 'maps/start_load',
  SET_OWNER = 'maps/setOwner',
  SET_MODE = 'maps/setMode',
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

interface ActionAdd extends MapAction {
  type: MapsActions.ADD,
}
interface ActionLoadSuccess extends MapAction {
  type: MapsActions.LOAD_SUCCESS,
  mapData: any,
}
interface ActionLoadError extends MapAction {
  type: MapsActions.LOAD_ERROR,
}
interface ActionStartLoad extends MapAction {
  type: MapsActions.START_LOAD,
}
interface ActionSetOwner extends MapAction {
  type: MapsActions.SET_OWNER,
  payload: MapOwner,
  drawer: MapsDrawer,
}
interface ActionSetMode extends MapAction {
  type: MapsActions.SET_MODE,
  payload: MapModes,
}
interface ActionSetField extends MapAction {
  type: MapsActions.SET_FIELD,
  field: 'mapID' | 'canvas' | 'element' | 'isElementEditing' | 'activeLayer' | 'utils' | 'isModified' | 'legends';
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

export type MapsAction = ActionAdd | ActionStartLoad | ActionLoadSuccess | ActionLoadError |
  ActionSetOwner | ActionSetMode | ActionSetField | ActionClearSelect |
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
  utils: {updateCanvas: () => {}, pointToMap: (point) => point},
};

const initMaps: MapsState = {};

/* --- reducer --- */

export const mapsReducer = (state: MapsState = initMaps, action: MapsAction): MapsState => {
  switch (action.type) {
    case MapsActions.ADD: {
      const mapState = state[action.formID]
      if (!mapState) return {...state, [action.formID]: initMapState};
      return {...state, [action.formID]: {...mapState, selecting: getDefaultSelecting()}};
    }

    case MapsActions.START_LOAD: {
      const formID = action.formID;
      return {...state, [formID]: {...state[formID], mapData: null, isLoadSuccessfully: undefined}};
    }

    case MapsActions.LOAD_SUCCESS: {
      const { formID, mapData } = action;
      return {...state, [formID]: {...state[formID], mapData, isLoadSuccessfully: true}};
    }

    case MapsActions.LOAD_ERROR: {
      return {...state, [action.formID]: {...state[action.formID], isLoadSuccessfully: false}};
    }

    case MapsActions.SET_OWNER: {
      const { formID, drawer, payload } = action;
      return {...state, [formID]: {...state[formID], owner: payload, drawer }};
    }

    case MapsActions.SET_MODE: {
      const { formID, payload: mode } = action;
      const newMapState: MapState = {...state[formID]};
      newMapState.mode = mode;
      newMapState.cursor = mode === MapModes.AWAIT_POINT ? 'crosshair' : 'auto';

      const isEditing = mode > MapModes.MOVE_MAP;
      newMapState.canvas.blocked = isEditing;

      if (newMapState.element) {
        newMapState.isElementEditing = isEditing;
        newMapState.element.edited = isEditing;
        newMapState.utils.updateCanvas();
      }
      return {...state, [formID]: newMapState};
    }

    case MapsActions.SET_FIELD: {
      const { formID, field, payload } = action;
      const newMapState: MapState = {...state[formID], [field]: payload};
      return {...state, [formID]: newMapState};
    }

    case MapsActions.CLEAR_SELECT: {
      const { formID, elementOnly } = action;
      const newMapState: MapState = {...state[formID]};

      clearOldData(newMapState);
      newMapState.canvas.blocked = false;
      newMapState.isElementEditing = false;

      if (newMapState.element) {
        newMapState.element.edited = false;
        newMapState.element = null;
      }
      if (!elementOnly) {
        newMapState.selecting = {nearestElements: [], activeIndex: 0, lastPoint: null};
        newMapState.cursor = 'auto';
      }

      return {...state, [formID]: newMapState};
    }

    case MapsActions.START_EDITING: {
      const newMapState: MapState = {...state[action.formID]};
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

      return {...state, [action.formID]: newMapState};
    }

    case MapsActions.ACCEPT_EDITING: {
      const newMapState: MapState = {...state[action.formID]};
      const element = newMapState.element;

      clearSelect(newMapState);
      newMapState.mode = MapModes.NONE;
      newMapState.canvas.blocked = false;

      if (element.type === 'polyline') {
        element.bounds = getBoundsByPoints(chunk(element.arcs[0].path, 2));
      }
      const modifiedLayer = newMapState.mapData.layers?.find(l => l.elements?.includes(element));
      if (modifiedLayer) {
        modifiedLayer.modified = true;
        newMapState.isModified = true;
      }

      newMapState.utils.updateCanvas();
      return {...state, [action.formID]: newMapState};
    }

    case MapsActions.CANCEL_EDITING: {
      const newMapState: MapState = {...state[action.formID]};
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

      newMapState.canvas.blocked = false;
      newMapState.isElementEditing = false;
      newMapState.mode = MapModes.NONE;
      newMapState.utils.updateCanvas();
      return {...state, [action.formID]: newMapState};
    }

    case MapsActions.START_CREATING: {
      const newMapState: MapState = {...state[action.formID]};
      clearSelect(newMapState);
      newMapState.mode = MapModes.CREATING;
      newMapState.utils.updateCanvas();
      return {...state, [action.formID]: newMapState};
    }

    case MapsActions.CREATE_ELEMENT: {
      const newMapState = {...state[action.formID]};
      newMapState.element = action.payload;
      newMapState.element.edited = true;
      newMapState.isElementEditing = true;

      newMapState.activeLayer.elements.push(action.payload);
      newMapState.activeLayer.modified = true;
      newMapState.isModified = true;

      newMapState.canvas.blocked = false;
      newMapState.mode = MapModes.MOVE_MAP;
      newMapState.cursor = 'auto';
      newMapState.utils.updateCanvas();

      return {...state, [action.formID]: newMapState};
    }

    case MapsActions.CANCEL_CREATING: {
      const newMapState: MapState = {...state[action.formID]};
      clearSelect(newMapState);
      newMapState.mode = MapModes.NONE;
      newMapState.utils.updateCanvas();
      return {...state, [action.formID]: newMapState};
    }

    default: return state;
  }
}
