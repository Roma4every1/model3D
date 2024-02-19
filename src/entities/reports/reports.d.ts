/** Состояние отчётов и программ.
 * + `models`: {@link ReportDict}
 * + `operations`: {@link OperationStatus}[]
 * */
interface Reports {
  /** Модели отчётов и программ по презентациям. */
  models: ReportDict;
  /** Активные операции. */
  operations: OperationStatus[];
}

/** Хранилище отчётов и программ по презентациям. */
type ReportDict = Record<ClientID, ReportModel[]>;

/** Модель программы/отчёта.
 * + `id`: {@link ReportID}
 * + `type`: {@link ReportType}
 * + `displayName`: {@link DisplayName}
 * + `parameters`: {@link Parameter}[]
 * + `channels`: {@link ChannelDict}
 * + `canRun: boolean`
 * + `paramsForCheckVisibility`: {@link ParameterID}[]
 * + `visible: boolean`
 * */
interface ReportModel {
  /** ID процедуры. */
  id: ReportID;
  /** Тип: программа или отчёт. */
  type: ReportType;
  /** Порядковый номер в списке, переданном от сервера. */
  orderIndex: number;
  /** Название процедуры. */
  displayName: DisplayName;
  /** Количество исполняемых блоков процедуры. */
  linkedPropertyCount: number;
  /** Список параметров процедуры. */
  parameters: Parameter[] | undefined;
  /** Каналы, необходимые для параметров. */
  channels: ChannelDict | undefined;
  /** Можно ли запустить процедуру при текущих параметрах. */
  canRun: boolean;
  /** Доступность процедуры при текущих параметрах. */
  available: boolean;
  /** Список параметров для проверки доступности. */
  availabilityParameters: ParameterID[];
}

/** Тип удалённой процедуры: программа или отчёт. */
type ReportType = 'program' | 'report';

/** Идентификатор процедуры. */
type ReportID = string;
/** Идентификатор операции. */
type OperationID = string;

/** Данные для инициализации списка параметров отчёта/программы. */
type ReportInitData = Pick<ReportModel, 'parameters' | 'channels' | 'canRun' | 'linkedPropertyCount'>;

/** Список связанных каналов отчёта.
 * + `clientID`: {@link ClientID}
 * + `reportID`: {@link ReportID}
 * + `channels`: {@link ChannelName}[]
 * */
interface RelatedReportChannels {
  /** ID клиента, в котором находится отчёт. */
  clientID: ClientID;
  /** ID отчёта. */
  reportID: ReportID;
  /** Названия связанных каналов. */
  channels: ChannelName[];
}

/* --- Server API --- */

/** Данные о параметрах и составных частях отчёта.
 * + `parameters`: {@link Parameter}[]
 * + `replaces`: {@link Record} of {@link ParameterID}
 * + `linkedPropertyCount: number`
 * */
interface ReportData {
  /** Кастомные параметры процедуры. */
  parameters: Parameter[];
  /** Все необходимые параметры для процедуры (для `reportString` и `queryString` false). */
  replaces: Record<ParameterID, boolean>;
  /** Количество исполняемых блоков процедуры. */
  linkedPropertyCount: number;
}

/** Данные о выполнении удалённой операции на сервере.
 * + `operationID`: {@link OperationID}
 * + `result: string`
 * + `error: string`
 * + `modifiedTables`: {@link TableID}[]
 * */
interface OperationData {
  /** ID операции для `reportString`, иначе `null`. */
  operationID: OperationID | null;
  /** Результат выполнения. */
  result: string | null;
  /** Лог ошибки. */
  error: string | null;
  /** Список таблиц, которые нужно обновить. */
  modifiedTables: TableID[];
}

/** Статус операции, выполняемой на сервере.
 * + `id`: {@link OperationID}
 * + `clientID`: {@link ClientID}
 * + `ready: boolean`
 * + `progress: number`
 * + `queueNumber: string`
 * + `timestamp: Date`
 * + `file`: {@link OperationFile}
 * + `comment: string`
 * + `defaultResult: string`
 * + `error: string`
 * + `modifiedTables`: {@link TableID}[]
 * + `log: string`
 * */
interface OperationStatus {
  /** ID операции. */
  id: OperationID;
  /** ID презентации, в рамках которой выполняется операция. */
  clientID: ClientID;
  /** Завершилась ли операция. */
  ready: boolean;
  /** Прогресс выполнения операции в процентах. */
  progress: number;
  /** Номер операции в очереди. */
  queueNumber: string;
  /** Временная метка начала обработки. */
  timestamp: Date;
  /** Информация о файле активного отчёта. */
  file: OperationFile | null;
  /** Дополнительный комментарий. */
  comment: string | null;
  /** Стандартный текст для отображения на интерфейсе. */
  defaultResult: string;
  /** Сообщение об ошибке. */
  error: string | null;
  /** Список таблиц, которые нужно обновить. */
  modifiedTables: TableID[];
  /** Лог выполнения. */
  log: string | null;
}

/** Информация о файле активного отчёта.
 * + `name: string`
 * + `extension: string`
 * + `type: string`
 * + `path: string`
 * */
interface OperationFile {
  /** Название файла. */
  name: string;
  /** Расширение файла. */
  extension: string;
  /** Метаданные файла. */
  type: string;
  /** Полный путь файла (для API). */
  path: string;
}
