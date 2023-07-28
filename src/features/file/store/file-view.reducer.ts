/* --- Action Types --- */

export enum FileViewActionType {
  CREATE = 'file/create',
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: FileViewActionType.CREATE,
  payload: FormStatePayload,
}

export type FileViewAction = ActionCreate;

/* --- Init State & Reducer --- */

const init: FileViewStates = {};

export function fileViewReducer(state: FileViewStates = init, action: FileViewAction): FileViewStates {
  switch (action.type) {

    case FileViewActionType.CREATE: {
      const id = action.payload.state.id;
      return {...state, [id]: {data: ''}};
    }

    default: return state;
  }
}
