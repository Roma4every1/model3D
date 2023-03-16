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
  name: string,
  stratumID: string,
  items: string
}


