export function fileViewStateSelector(this: FormID, state: WState): FileViewState {
  return state.fileViews[this];
}
