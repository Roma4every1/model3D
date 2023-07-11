import { ChartsAction, ChartsActionType } from './chart.reducer';


/** Добавить новое состояние графика. */
export function createChartState(id: FormID, settings: ChartFormSettings): ChartsAction {
  return {type: ChartsActionType.SET, payload: {id, settings}};
}

/** Установить шаг по времени для графика. */
export function setChartDateStep(id: FormID, step: ChartDateStep): ChartsAction {
  return {type: ChartsActionType.SET_FIELD, payload: {id, field: 'dateStep', value: step}};
}

/** Установить видимость окошка со значениями для графика. */
export function setChartTooltipVisibility(id: FormID, visibility: boolean): ChartsAction {
  return {type: ChartsActionType.SET_FIELD, payload: {id, field: 'tooltip', value: visibility}};
}

/** Установить функцию для сохранения графика в PNG. */
export function setChartDownloadFn(id: FormID, fn: Function): ChartsAction {
  return {type: ChartsActionType.SET_FIELD, payload: {id, field: 'downloadChart', value: fn}};
}
