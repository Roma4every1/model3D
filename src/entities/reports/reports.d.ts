/** Модель программы.
 * + `id`: {@link ReportID}
 * + `displayName`: {@link DisplayName}
 * + `needCheckVisibility: boolean`
 * + `paramsForCheckVisibility`: {@link ParameterID}[]
 * + `visible: boolean`
 * */
interface ReportInfo {
  /** ID программы */
  id: ReportID,
  /** Название программы. */
  displayName: DisplayName,
  /** Необходимо ли проверять видимость программы. */
  needCheckVisibility: boolean,
  /** Список параметров для проверки видимости. */
  paramsForCheckVisibility: ParameterID[],
  /** Показывать ли программу на интерфейсе. */
  visible: boolean,
}

/** Идентификатор отчёта. */
type ReportID = string;

/* --- --- */

type ReportDict = Record<ReportID, Report>;

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
  Id: ReportID,
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
