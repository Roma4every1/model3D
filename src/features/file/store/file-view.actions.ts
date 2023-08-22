import { FileViewAction, FileViewActionType } from './file-view.reducer';


export function createFileViewState(payload: FormStatePayload): FileViewAction {
  return {type: FileViewActionType.CREATE, payload};
}

export function setFileViewModel(id: FormID, model: FileViewModel): FileViewAction {
  return {type: FileViewActionType.SET_MODEL, payload: {id, model}};
}
