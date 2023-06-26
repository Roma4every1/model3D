/** Хранилище состояний трасс. */
interface TracesState {
  currentTraceData: TraceModel | null,
  oldTraceData: TraceModel | null,
  isTraceEditing: boolean,
  isTraceCreating: boolean
}

/** ## Данные текущей трассы.
 * + `id` — индекс в таблице
 * + `name` — имя трассы
 * + `stratumID` — индекс пласта
 * + `items` - UWID точкек трассы
 * */
interface TraceModel {
  id: number | null,
  name: string | null,
  stratumID: string | null,
  items: number[] | null
}

/** ## Данные узла трассы.
 * + `UWID` — индекс скважины
 * + `name` — имя скважины
 * */
interface TracePoint {
  UWID: number,
  name: string,
}
