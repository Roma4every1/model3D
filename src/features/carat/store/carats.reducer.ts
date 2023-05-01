// import { mockCaratSettings } from '../lib/data';
import { settingsToState } from '../lib/initialization';

/* --- Action Types --- */

export enum CaratsActions {
  CREATE = 'carat/create',
  SET_DATA = 'carat/data',
  SET_ACTIVE_COLUMN = 'carat/column',
  SET_CANVAS = 'carat/setCanvas',
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: CaratsActions.CREATE,
  payload: {id: FormID, channels: ChannelDict, formState: FormState},
}
interface ActionSetData {
  type: CaratsActions.SET_DATA,
  payload: {id: FormID, data: ChannelDict},
}
interface ActionSetColumnGroup {
  type: CaratsActions.SET_ACTIVE_COLUMN,
  payload: {id: FormID, group: ICaratColumnGroup},
}
interface ActionSetCanvas {
  type: CaratsActions.SET_CANVAS,
  payload: {id: FormID, canvas: HTMLCanvasElement},
}

export type CaratsAction = ActionCreate | ActionSetData | ActionSetColumnGroup | ActionSetCanvas;

/* --- Init State & Reducer --- */

const init: CaratsState = {};

export const caratsReducer = (state: CaratsState = init, action: CaratsAction): CaratsState => {
  switch (action.type) {

    case CaratsActions.CREATE: {
      const { id, channels, formState } = action.payload;
      return {...state, [id]: settingsToState(formState, channels)};
    }

    case CaratsActions.SET_DATA: {
      const { id, data } = action.payload;
      const { stage } = state[id];
      stage.setChannelData(data); stage.render();
      stage.setCurveData(data).then(() => stage.render());
      return {...state, [id]: {...state[id]}}
    }

    case CaratsActions.SET_ACTIVE_COLUMN: {
      const { id, group } = action.payload;
      return {...state, [id]: {...state[id], activeGroup: group}};
    }

    case CaratsActions.SET_CANVAS: {
      const { id, canvas } = action.payload;
      const { stage, observer, canvas: oldCanvas } = state[id];
      if (oldCanvas) observer.unobserve(oldCanvas);

      stage.setCanvas(canvas);
      observer.observe(canvas);
      return {...state, [id]: {...state[id], canvas}};
    }

    default: return state;
  }
};
