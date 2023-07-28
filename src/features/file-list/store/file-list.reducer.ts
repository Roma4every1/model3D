/* --- Action Types --- */

export enum FileListActionType {
  CREATE = 'fileList/create',
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: FileListActionType.CREATE,
  payload: FormStatePayload,
}

export type FileListAction = ActionCreate;

/* --- Init State & Reducer --- */

const init: FileListStates = {};

export function fileListReducer(state: FileListStates = init, action: FileListAction): FileListStates {
  switch (action.type) {

    case FileListActionType.CREATE: {
      const id = action.payload.state.id;
      return {...state, [id]: {activeFile: ''}};
    }

    default: return state;
  }
}
