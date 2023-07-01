import { settingsToState } from '../lib/adapter';

/* --- Action Types --- */

export enum CaratsActions {
  CREATE = 'carat/create',
  SET_ACTIVE_GROUP = 'carat/group',
  SET_ACTIVE_CURVE = 'carat/curve',
  SET_DATA = 'carat/data',
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
interface ActionSetData {
  type: CaratsActions.SET_DATA,
  payload: {id: FormID, data: ChannelDict},
}
interface ActionSetCanvas {
  type: CaratsActions.SET_CANVAS,
  payload: {id: FormID, canvas: HTMLCanvasElement},
}

export type CaratsAction = ActionCreate | ActionSetActiveGroup | ActionSetActiveCurve |
  ActionSetData | ActionSetCanvas;

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
      const track = state[id].stage.getActiveTrack();

      const curveGroup = group.hasCurveColumn()
        ? group
        : track.getGroups().find((group) => group.hasCurveColumn());

      return {...state, [id]: {...state[id], activeGroup: group, curveGroup}};
    }

    case CaratsActions.SET_ACTIVE_CURVE: {
      const { id, curve } = action.payload;
      const caratState = state[id];
      if (curve === caratState.activeCurve) return state;
      return {...state, [id]: {...caratState, activeCurve: curve}};
    }

    case CaratsActions.SET_DATA: {
      const { id, data } = action.payload;
      return {...state, [id]: {...state[id], lastData: data}};
    }

    case CaratsActions.SET_CANVAS: {
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
