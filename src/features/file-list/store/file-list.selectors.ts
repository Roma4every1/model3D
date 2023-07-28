export function fileListStateSelector(this: FormID, state: WState): FileListState {
  return state.fileLists[this];
}
