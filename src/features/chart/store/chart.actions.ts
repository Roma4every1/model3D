import { useChartStore } from './chart.store';
import { settingsToChartState } from '../lib/initialization';


/** Добавить новое состояние графика. */
export function createChartState(payload: FormStatePayload): void {
  const id = payload.state.id;
  useChartStore.setState({[id]: settingsToChartState(payload.settings)});
}

/** Установить шаг по времени для графика. */
export function setChartDateStep(id: FormID, step: ChartDateStep): void {
  const state = useChartStore.getState()[id];
  useChartStore.setState({[id]: {...state, dateStep: step}});
}

/** Установить видимость окошка со значениями для графика. */
export function setChartTooltipVisibility(id: FormID, visibility: boolean): void {
  const state = useChartStore.getState()[id];
  useChartStore.setState({[id]: {...state, tooltip: visibility}});
}

/** Установить функцию для сохранения графика в PNG. */
export function setChartDownloadFn(id: FormID, fn: () => Promise<void>): void {
  const state = useChartStore.getState()[id];
  useChartStore.setState({[id]: {...state, downloadChart: fn}});
}
