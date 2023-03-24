import { caratSettings, caratColumns } from '../lib/data';

/* --- Action Types --- */

export enum CaratsActions {
  ADD = 'carat/add',
  SET_CANVAS = 'carat/setCanvas',
  SET_DRAWER = 'carat/setDrawer',
}

/* --- Action Interfaces --- */

interface ActionAdd {
  type: CaratsActions.ADD,
  formID: FormID,
}
interface ActionSetCanvas {
  type: CaratsActions.SET_CANVAS,
  formID: FormID,
  payload: HTMLCanvasElement,
}
interface ActionSetDrawer {
  type: CaratsActions.SET_DRAWER,
  formID: FormID,
  payload: ICaratDrawer,
}

export type CaratsAction = ActionAdd | ActionSetCanvas | ActionSetDrawer;

/* --- Init State & Reducer --- */

const defaultCaratState: CaratState = {
  settings: caratSettings,
  columns: caratColumns,
  canvas: null,
  drawer: null,
};

const init: CaratsState = {};

export const caratsReducer = (state: CaratsState = init, action: CaratsAction): CaratsState => {
  switch (action.type) {

    case CaratsActions.ADD: {
      return {...state, [action.formID]: JSON.parse(JSON.stringify(defaultCaratState))};
    }

    case CaratsActions.SET_CANVAS: {
      return {...state, [action.formID]: {...state[action.formID], canvas: action.payload}};
    }

    case CaratsActions.SET_DRAWER: {
      return {...state, [action.formID]: {...state[action.formID], drawer: action.payload}};
    }

    default: return state;
  }
};
