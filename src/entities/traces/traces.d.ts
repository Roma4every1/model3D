
/** Хранилище состояний трасс. */
interface TracesState {
  currentTraceData: TraceModel | null,
  oldTraceData: TraceModel | null,
  isTraceEditing: boolean,
  isTraceCreating: boolean
}

/** ## Данные текущей трассы.
 * + `ID` — индекс в таблице
 * + `name` — имя трассы
 * + `stratumID` — индекс пласта
 * + `items` - UWID точкек трассы
 * */
interface TraceModel {
  id: number | null,
  name: string | null,
  stratumID: string | null,
  items: string[] | null
}




/** ## Данные строки трассы в таблице.
 * + `ID` — индекс в таблице
 * + `Cells` — имя трассы
 * */
interface TraceRow {
  ID: number | null,
  Cells: TraceData
}

/** ## Данные строки трассы в таблице.
 * + `ID` — индекс в таблице
 * + `name` — имя трассы
 * + `stratumID` — индекс пласта
 * + `items` - UWID точкек трассы
 * */
interface TraceData {
  ID: number | null,
  name: string | null,
  stratumID: string | null,
  items: string | null
}


