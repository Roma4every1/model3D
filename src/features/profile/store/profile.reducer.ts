import {settingsToProfileState} from "../rendering/adapter.ts";


/* --- Action Types --- */

export enum ProfileActionType {
  CREATE = 'profile/create',
  SET_CANVAS = 'profile/setCanvas',
  SET_LOADING = 'profile/loading',
  SET_ACTIVE_PLAST_LIST = 'profile/plastList'
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: ProfileActionType.CREATE;
  payload: FormStatePayload;
}

interface ActionSetCanvas {
  type: ProfileActionType.SET_CANVAS;
  payload: { id: FormID, canvas: HTMLCanvasElement }
}

interface ActionSetLoading {
  type: ProfileActionType.SET_LOADING;
  payload: {id: FormID, loading: Partial<CaratLoading>};
}

interface ActionSetPlastList {
  type: ProfileActionType.SET_ACTIVE_PLAST_LIST;
  payload: {id: FormID, plastList: string[]};
}



export type ProfileAction = ActionCreate | ActionSetCanvas | ActionSetLoading | ActionSetPlastList;

/* --- Init State & Reducer --- */

const init: ProfileStates = {};

export function profileReducer(state: ProfileStates = init, action: ProfileAction): ProfileStates {
  switch (action.type) {

    case ProfileActionType.CREATE: {
      const id = action.payload.state.id;
      return {...state, [id]: settingsToProfileState()};
    }

    case ProfileActionType.SET_CANVAS: {
      const {id, canvas} = action.payload;
      const { stage, observer, canvas: oldCanvas } = state[id];

      if (oldCanvas) observer.unobserve(oldCanvas);
      if (canvas) observer.observe(canvas);

      stage.setCanvas(canvas);
      return {...state, [id]: {...state[id], canvas}};
    }

    case ProfileActionType.SET_LOADING: {
      const { id, loading } = action.payload;
      const newLoading = {...state[id].loading, ...loading};
      return {...state, [id]: {...state[id], loading: newLoading}};
    }

    case ProfileActionType.SET_ACTIVE_PLAST_LIST: {
      const { id, plastList } = action.payload;
      state[id].loader.activePlasts = plastList;
      return {...state, [id]: {...state[id]}};
    }

    default:
      return state;
  }
}
