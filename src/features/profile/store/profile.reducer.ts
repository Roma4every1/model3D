import {settingsToProfileState} from "../rendering/adapter.ts";


/* --- Action Types --- */

export enum ProfileActionType {
  CREATE = 'profile/create',
  SET_CANVAS = 'profile/setCanvas',
  SET_LOADING = 'profile/loading'
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

export type ProfileAction = ActionCreate | ActionSetCanvas | ActionSetLoading;

/* --- Init State & Reducer --- */

const init: ProfileStates = {};

export function profileReducer(state: ProfileStates = init, action: ProfileAction): ProfileStates {
  switch (action.type) {

    case ProfileActionType.CREATE: {
      const id = action.payload.state.id;
      return {...state, [id]: settingsToProfileState(action.payload)};
    }

    case ProfileActionType.SET_CANVAS: {
      const {id, canvas} = action.payload;
      state[id].canvas = canvas;
      state[id].stage.setCanvas(canvas);
      return {...state};
    }

    case ProfileActionType.SET_LOADING: {
      const { id, loading } = action.payload;
      const newLoading = {...state[id].loading, ...loading};
      return {...state, [id]: {...state[id], loading: newLoading}};
    }

    default:
      return state;
  }
}
