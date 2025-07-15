// model/store/model.actions.ts
import { ModelStateFactory } from '../lib/initialization';
import { useModelStore } from './model.store';

export function createModelState(payload: FormStatePayload): void {
  const id = payload.state.id;
  
  useModelStore.setState({ [id]: ModelStateFactory.create(id, payload) });
}

export function setModelStatus(id: FormID, status): void {
  const state = useModelStore.getState()[id];
  useModelStore.setState({[id]: {...state, status}});
}
export function setModelCanvas(id: FormID, canvas: HTMLDivElement | null) {
  const modelState = useModelStore.getState()[id];
  const { stage, observer, canvas: oldCanvas } = modelState;
  const resizeObserver = new ResizeObserver(() => { stage.handleResize(); });
  if (oldCanvas) observer.unobserve(oldCanvas);
  if (canvas) resizeObserver.observe(canvas);

  useModelStore.setState({[id]: {...modelState, canvas, observer: resizeObserver}});
}

