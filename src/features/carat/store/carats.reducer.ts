import { mockCaratSettings } from '../lib/data';
import { settingsToState } from '../lib/initialization';

/* --- Action Types --- */

export enum CaratsActions {
  CREATE = 'carat/create',
  SET_ACTIVE_COLUMN = 'carat/column',
  SET_CANVAS = 'carat/setCanvas',
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: CaratsActions.CREATE,
  payload: {id: FormID, channels: ChannelDict},
}
interface ActionSetColumn {
  type: CaratsActions.SET_ACTIVE_COLUMN,
  payload: {id: FormID, column: ICaratColumn},
}
interface ActionSetCanvas {
  type: CaratsActions.SET_CANVAS,
  payload: {id: FormID, canvas: HTMLCanvasElement},
}

export type CaratsAction = ActionCreate | ActionSetColumn | ActionSetCanvas;

/* --- Init State & Reducer --- */

const init: CaratsState = {};

export const caratsReducer = (state: CaratsState = init, action: CaratsAction): CaratsState => {
  switch (action.type) {

    case CaratsActions.CREATE: {
      const { id, channels } = action.payload;
      return {...state, [id]: settingsToState(channels, mockCaratSettings)};
    }

    case CaratsActions.SET_ACTIVE_COLUMN: {
      const { id, column } = action.payload;
      return {...state, [id]: {...state[id], activeColumn: column}};
    }

    case CaratsActions.SET_CANVAS: {
      const { id, canvas } = action.payload;
      const caratState = state[id];

      caratState.stage.setCanvas(canvas);
      return {...state, [id]: {...state[id], canvas: canvas}};
    }

    default: return state;
  }
};
