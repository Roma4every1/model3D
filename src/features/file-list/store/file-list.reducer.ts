/* --- Action Types --- */

export enum FileListActionType {
  CREATE = 'fileList/create',
  SET_ACTIVE_FILE = 'fileList/setActive'
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: FileListActionType.CREATE;
  payload: FormStatePayload;
}

interface ActionSetActiveFile {
  type: FileListActionType.SET_ACTIVE_FILE;
  payload: {id: FormID, file: string};
}

export type FileListAction = ActionCreate | ActionSetActiveFile;

/* --- Init State & Reducer --- */

const init: FileListStates = {};

export function fileListReducer(state: FileListStates = init, action: FileListAction): FileListStates {
  switch (action.type) {

    case FileListActionType.CREATE: {
      const id = action.payload.state.id;
      return {...state, [id]: {activeFile: null}};
    }

    case FileListActionType.SET_ACTIVE_FILE: {
      const { id, file } = action.payload;
      return {...state, [id]: {activeFile: file}};
    }

    default: return state;
  }
}
