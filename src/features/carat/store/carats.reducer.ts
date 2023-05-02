// import { mockCaratSettings } from '../lib/data';
import { settingsToState } from '../lib/initialization';

/* --- Action Types --- */

export enum CaratsActions {
  CREATE = 'carat/create',
  SET_ACTIVE_GROUP = 'carat/group',
  SET_ACTIVE_CURVE = 'carat/curve',
  SET_CANVAS = 'carat/setCanvas',
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: CaratsActions.CREATE,
  payload: {id: FormID, channels: ChannelDict, formState: FormState},
}
interface ActionSetActiveGroup {
  type: CaratsActions.SET_ACTIVE_GROUP,
  payload: {id: FormID, group: ICaratColumnGroup},
}
interface ActionSetActiveCurve {
  type: CaratsActions.SET_ACTIVE_CURVE,
  payload: {id: FormID, curve: any},
}
interface ActionSetCanvas {
  type: CaratsActions.SET_CANVAS,
  payload: {id: FormID, canvas: HTMLCanvasElement},
}

export type CaratsAction = ActionCreate | ActionSetActiveGroup | ActionSetActiveCurve | ActionSetCanvas;

/* --- Init State & Reducer --- */

const init: CaratsState = {};

export const caratsReducer = (state: CaratsState = init, action: CaratsAction): CaratsState => {
  switch (action.type) {

    case CaratsActions.CREATE: {
      const { id, channels, formState } = action.payload;
      return {...state, [id]: settingsToState(formState, channels)};
    }

    case CaratsActions.SET_ACTIVE_GROUP: {
      const { id, group } = action.payload;
      return {...state, [id]: {...state[id], activeGroup: group}};
    }

    case CaratsActions.SET_ACTIVE_CURVE: {
      const { id, curve } = action.payload;
      return {...state, [id]: {...state[id], activeCurve: curve}};
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
