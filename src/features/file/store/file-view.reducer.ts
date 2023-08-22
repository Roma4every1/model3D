import { toFileViewState } from '../lib/adapter';

/* --- Action Types --- */

export enum FileViewActionType {
  CREATE = 'file/create',
  SET_MODEL = 'file/model',
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: FileViewActionType.CREATE;
  payload: FormStatePayload;
}
interface ActionSetModel {
  type: FileViewActionType.SET_MODEL;
  payload: {id: FormID, model: FileViewModel};
}

export type FileViewAction = ActionCreate | ActionSetModel;

/* --- Init State & Reducer --- */

const init: FileViewStates = {};

export function fileViewReducer(state: FileViewStates = init, action: FileViewAction): FileViewStates {
  switch (action.type) {

    case FileViewActionType.CREATE: {
      const id = action.payload.state.id;
      return {...state, [id]: toFileViewState(action.payload)};
    }

    case FileViewActionType.SET_MODEL: {
      const { id, model } = action.payload;
      return {...state, [id]: {...state[id], model}}
    }

    default: return state;
  }
}
