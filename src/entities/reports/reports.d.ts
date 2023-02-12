/** Список SQL-программ и отчётов. */
type ProgramListData = ProgramListItem[];

/** Модель программы.
 * + `id`: {@link ProgramID}
 * + `displayName: string`
 * + `needCheckVisibility: boolean`
 * + `paramsForCheckVisibility`: {@link ParameterID}[]
 * + `visible: boolean`
 * */
interface ProgramListItem {
  /** ID программы */
  id: ProgramID,
  /** Название программы. */
  displayName: string,
  /** Необходимо ли проверять видимость программы. */
  needCheckVisibility: boolean,
  /** Список параметров для проверки видимости. */
  paramsForCheckVisibility: ParameterID[],
  /** Показывать ли программу на интерфейсе. */
  visible: boolean,
}

/** Идентификатор программы */
type ProgramID = string;

/* --- --- */

type ReportsState = Record<string, Report>;

interface Report {
  Comment: string,
  Cur_page: any,
  ReportResult: any,
  DefaultResult: string,
  DisplayType: number,
  /** Timestamp завершения работы. */
  Dt: string,
  Error: string,
  ErrorType: any,
  Hash: string,
  /** ID презентации. */
  ID_PR: FormID,
  Id: string,
  IsReport: string,
  ModifiedTables: any,
  Ord: string,
  Pages: any,
  Path: string,
  Progress: number,
  SessionId: SessionID,
  SystemName: SystemID,
  Usr: string,
  WrongResult: boolean,
}

interface OperationResult {
  isReady: boolean,
  report: Report,
  reportLog: any,
}
