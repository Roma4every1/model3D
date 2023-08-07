import { FileListAction, FileListActionType } from './file-list.reducer';


export function createFileListState(payload: FormStatePayload): FileListAction {
  return {type: FileListActionType.CREATE, payload};
}

export function setActiveFile(id: FormID, payload: string): FileListAction {
  return {type: FileListActionType.SET_ACTIVE_FILE, id, payload};
}
