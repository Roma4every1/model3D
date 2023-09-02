import { settingsToCaratState } from '../lib/adapter';

/* --- Action Types --- */

export enum CaratActionType {
  CREATE = 'carat/create',
  SET_LOADING = 'carat/loading',
  SET_CANVAS = 'carat/setCanvas',
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: CaratActionType.CREATE;
  payload: FormStatePayload;
}
interface ActionSetLoading {
  type: CaratActionType.SET_LOADING;
  payload: {id: FormID, loading: Partial<CaratLoading>};
}
interface ActionSetCanvas {
  type: CaratActionType.SET_CANVAS;
  payload: {id: FormID, canvas: HTMLCanvasElement};
}

export type CaratAction = ActionCreate | ActionSetLoading | ActionSetCanvas;

/* --- Init State & Reducer --- */

const init: CaratStates = {};

export const caratsReducer = (state: CaratStates = init, action: CaratAction): CaratStates => {
  switch (action.type) {

    case CaratActionType.CREATE: {
      const id = action.payload.state.id;
      return {...state, [id]: settingsToCaratState(action.payload)};
    }

    case CaratActionType.SET_LOADING: {
      const { id, loading } = action.payload;
      const newLoading = {...state[id].loading, ...loading};
      return {...state, [id]: {...state[id], loading: newLoading}};
    }

    case CaratActionType.SET_CANVAS: {
      const { id, canvas } = action.payload;
      const { stage, observer, canvas: oldCanvas } = state[id];

      if (oldCanvas) observer.unobserve(oldCanvas);
      if (canvas) observer.observe(canvas);

      stage.setCanvas(canvas);
      return {...state, [id]: {...state[id], canvas}};
    }

    default: return state;
  }
};
