import { settingsToCaratState } from '../lib/adapter';

/* --- Action Types --- */

export enum CaratActionType {
  CREATE = 'carat/create',
  SET_ACTIVE_GROUP = 'carat/group',
  SET_ACTIVE_CURVE = 'carat/curve',
  SET_DATA = 'carat/data',
  SET_CANVAS = 'carat/setCanvas',
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: CaratActionType.CREATE,
  payload: FormStatePayload,
}
interface ActionSetActiveGroup {
  type: CaratActionType.SET_ACTIVE_GROUP,
  payload: {id: FormID, group: ICaratColumnGroup},
}
interface ActionSetActiveCurve {
  type: CaratActionType.SET_ACTIVE_CURVE,
  payload: {id: FormID, curve: any},
}
interface ActionSetData {
  type: CaratActionType.SET_DATA,
  payload: {id: FormID, data: ChannelDataDict[]},
}
interface ActionSetCanvas {
  type: CaratActionType.SET_CANVAS,
  payload: {id: FormID, canvas: HTMLCanvasElement},
}

export type CaratAction = ActionCreate | ActionSetActiveGroup | ActionSetActiveCurve |
  ActionSetData | ActionSetCanvas;

/* --- Init State & Reducer --- */

const init: CaratStates = {};

export const caratsReducer = (state: CaratStates = init, action: CaratAction): CaratStates => {
  switch (action.type) {

    case CaratActionType.CREATE: {
      const id = action.payload.state.id;
      return {...state, [id]: settingsToCaratState(action.payload)};
    }

    case CaratActionType.SET_ACTIVE_GROUP: {
      const { id, group } = action.payload;
      const track = state[id].stage.getActiveTrack();

      const curveGroup = group.hasCurveColumn()
        ? group
        : track.getGroups().find((group) => group.hasCurveColumn());

      return {...state, [id]: {...state[id], activeGroup: group, curveGroup}};
    }

    case CaratActionType.SET_ACTIVE_CURVE: {
      const { id, curve } = action.payload;
      const caratState = state[id];
      if (curve === caratState.activeCurve) return state;
      return {...state, [id]: {...caratState, activeCurve: curve}};
    }

    case CaratActionType.SET_DATA: {
      const { id, data } = action.payload;
      return {...state, [id]: {...state[id], lastData: data}};
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
