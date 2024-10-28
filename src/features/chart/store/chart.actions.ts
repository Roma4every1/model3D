import { useChartStore } from './chart.store';
import { settingsToChartState } from '../lib/initialization';


/** Добавить новое состояние графика. */
export function createChartState(payload: FormStatePayload): void {
  const id = payload.state.id;
  useChartStore.setState({[id]: settingsToChartState(payload)});
}

/** Не меняя фактическое состояние формы вызывает рендер зависящих компонентов. */
export function updateChartState(id: FormID): void {
  const state = useChartStore.getState()[id];
  useChartStore.setState({[id]: {...state}});
}

/** Обновляет данные графика. */
export function setChartChannelData(id: FormID, data: ChannelDict): void {
  const state = useChartStore.getState()[id];
  state.stage.setChannelData(data);
  useChartStore.setState({[id]: {...state}});
}

/** Обновляет данные справочников графика. */
export function setChartLookupData(id: FormID, data: ChannelDict): void {
  const state = useChartStore.getState()[id];
  state.stage.setLookupData(data);
  useChartStore.setState({[id]: {...state}});
}
