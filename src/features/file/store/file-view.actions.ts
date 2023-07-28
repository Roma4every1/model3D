import { FileViewAction, FileViewActionType } from './file-view.reducer';


export function createFileViewState(payload: FormStatePayload): FileViewAction {
  return {type: FileViewActionType.CREATE, payload};
}
