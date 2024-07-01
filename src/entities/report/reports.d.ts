/** Состояние отчётов и программ. */
interface Reports {
  /** Модели отчётов и программ по презентациям. */
  models: ReportDict;
  /** Активные операции. */
  operations: OperationStatus[];
  /** Сущность, управляющая разметкой приложения. */
  layoutController: any;
}

/** Хранилище отчётов и программ по презентациям. */
type ReportDict = Record<ClientID, ReportModel[]>;

/** Модель программы или отчёта. */
interface ReportModel {
  /** ID процедуры. */
  readonly id: ReportID;
  /** Тип: программа или отчёт. */
  readonly type: ReportType;
  /** ID клиента, которому принадлежит процедура. */
  readonly owner: ClientID;
  /** Порядковый номер в списке, переданном от сервера. */
  readonly orderIndex: number;
  /** Название процедуры. */
  readonly displayName: string;
  /** Список параметров для проверки доступности. */
  readonly availabilityParameters: ParameterID[];
  /** Доступность процедуры при текущих параметрах системы, `undefined` означает неактуальность. */
  available: boolean | undefined;
  /** Можно ли запустить процедуру при её текущих параметрах, `undefined` означает загрузку. */
  runnable: boolean | undefined;
  /** Список параметров процедуры. */
  parameters?: Parameter[];
  /** Каналы, необходимые для параметров. */
  channels?: ChannelDict;
  /** Количество исполняемых блоков процедуры. */
  linkedPropertyCount?: number;
  /** ID параметров процедуры, значения которых нужно брать на основе параметров системны. */
  relations?: Map</* report */ ParameterID, /* system */ ParameterID>;
  /** Нужно ли делать проверку связанных параметров. */
  checkRelations?: boolean;
}

/** Тип удалённой процедуры: программа или отчёт. */
type ReportType = 'program' | 'report';

/** Идентификатор процедуры. */
type ReportID = string;
/** Идентификатор операции. */
type OperationID = string;

/* --- Server API --- */

/** Данные о выполнении удалённой операции на сервере. */
interface OperationData {
  /** ID операции для `reportString`, иначе `null`. */
  operationID: OperationID | null;
  /** Результат выполнения. */
  result: string | null;
  /** Лог ошибки. */
  error: string | null;
  /** Список таблиц, которые нужно обновить. */
  modifiedTables: QueryID[];
}

/** Статус операции, выполняемой на сервере. */
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
  modifiedTables: QueryID[];
  /** Лог выполнения. */
  log: string | null;
}

/** Информация о файле активного отчёта. */
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
