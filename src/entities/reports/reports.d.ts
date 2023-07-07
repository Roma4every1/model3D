/** Состояние отчётов и программ.
 * + `models`: {@link ReportDict}
 * + `operations`: {@link OperationStatus}[]
 * */
interface Reports {
  /** Модели отчётов и программ по презентациям. */
  models: ReportDict,
  /** Активные операции. */
  operations: OperationStatus[],
}

/** Хранилище отчётов и программ по презентациям. */
type ReportDict = Record<FormID, ReportModel[]>;

/** Модель программы/отчёта.
 * + `id`: {@link ReportID}
 * + `displayName`: {@link DisplayName}
 * + `parameters`: {@link Parameter}[]
 * + `channels`: {@link ChannelDict}
 * + `canRun: boolean`
 * + `needCheckVisibility: boolean`
 * + `paramsForCheckVisibility`: {@link ParameterID}[]
 * + `visible: boolean`
 * */
interface ReportModel {
  /** ID программы */
  id: ReportID,
  /** Название программы. */
  displayName: DisplayName,
  /** Список параметров отчёта. */
  parameters: Parameter[] | undefined,
  /** Каналы, необходимые для параметров. */
  channels: ChannelDict | undefined,
  /** Можно ли запустить отчёт при текущих параметрах. */
  canRun: boolean,
  /** Необходимо ли проверять видимость программы. */
  needCheckVisibility: boolean,
  /** Список параметров для проверки видимости. */
  paramsForCheckVisibility: ParameterID[],
  /** Показывать ли программу на интерфейсе. */
  visible: boolean,
}

/** Статус операции, выполняемой на сервере. */
interface OperationStatus {
  /** Идентификатор операции. */
  id: OperationID,
  /** ID клиента (форма/презентация). */
  clientID: FormID,
  /** Номер операции в очереди. */
  queueNumber: string,
  /** Прогресс выполнения операции в процентах. */
  progress: number,
  /** Временная метка начала обработки. */
  timestamp: Date,
  /** Информация о файле активного отчёта. */
  file: OperationFile | null,
  /** Дополнительный комментарий. */
  description: string,
  /** Стандартный текст для отображения на интерфейсе. */
  defaultResult: string,
  /** Сообщение об ошибке. */
  error: string,
}

/** Информация о файле активного отчёта. */
interface OperationFile {
  /** Название файла. */
  name: string,
  /** Полный путь файла (для API). */
  path: string,
  /** Расширение файла. */
  extension: string,
}

/** Идентификатор отчёта. */
type ReportID = string;
/** Идентификатор операции. */
type OperationID = string;

/** Данные для инициализации списка параметров отчёта/программы. */
type ReportInitData = Pick<ReportModel, 'parameters' | 'channels' | 'canRun'>;

/** Список связанных каналов отчёта. */
interface RelatedReportChannels {
  /** ID клиента, в котором находится отчёт. */
  clientID: FormID,
  /** ID отчёта. */
  reportID: ReportID,
  /** Названия связанных каналов. */
  channels: ChannelName[],
}

/* --- Server API --- */

interface NewOperationData {
  ReportResult: string,
  OperationId: OperationID,
  Pages: any,
  CurrentPage: any,
  WrongResult: boolean,
  IsReady: boolean,
  SessionId: string,
  ModifiedTables: any
}

interface ReportStatus {
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
  Id: OperationID,
  IsReport: string, // "1" => true
  /** ID таблиц, в которые были внесены изменения. */
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
  report: ReportStatus,
  reportLog: any,
}
