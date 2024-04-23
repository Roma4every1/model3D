import { useFileViewStore } from './file-view.store';
import { toFileViewState } from '../lib/adapter';


export function createFileViewState(payload: FormStatePayload): void {
  const id = payload.state.id;
  useFileViewStore.setState({[id]: toFileViewState(payload)});
}

export function setFileViewModel(id: FormID, model: FileViewModel): void {
  const state = useFileViewStore.getState()[id];
  useFileViewStore.setState({[id]: {...state, model}});
}
