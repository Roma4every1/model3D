import { FileListAction, FileListActionType } from './file-list.reducer';


export function createFileListState(payload: FormStatePayload): FileListAction {
  return {type: FileListActionType.CREATE, payload};
}
