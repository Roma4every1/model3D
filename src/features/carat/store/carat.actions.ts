import { useCaratStore } from './carat.store';
import { settingsToCaratState } from '../lib/initialization';


/** Добавляет в хранилище состояний каротажа новую каротажную форму. */
export function createCaratState(payload: FormStatePayload): void {
  const id = payload.state.id;
  useCaratStore.setState({[id]: settingsToCaratState(payload)});
}

/** Обновляет состояние загрузки каротажа. */
export function setCaratLoading(id: FormID, loading: Partial<CaratLoading>): void {
  const state = useCaratStore.getState()[id];
  const newLoading = {...state.loading, ...loading};
  useCaratStore.setState({[id]: {...state, loading: newLoading}});
}

/** Установить элемент холста. */
export function setCaratCanvas(id: FormID, canvas: HTMLCanvasElement): void {
  const state = useCaratStore.getState()[id];
  const { stage, observer, canvas: oldCanvas } = state;

  if (oldCanvas) observer.unobserve(oldCanvas);
  if (canvas) observer.observe(canvas);

  stage.setCanvas(canvas);
  useCaratStore.setState({[id]: {...state, canvas}});
}
