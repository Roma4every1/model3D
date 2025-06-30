/** Модель серверной программы. */
interface Program {
  /** ID программы. */
  readonly id: ProgramID;
  /** Тип: обычная программа или отчёт. */
  readonly type: ProgramType;
  /** ID клиента, которому принадлежит программа. */
  readonly owner: ClientID;
  /** Порядковый номер в списке, переданном с сервера. */
  readonly orderIndex: number;
  /** Подпись для программы. */
  readonly displayName: string;
  /** Список параметров для проверки доступности. */
  readonly availabilityParameters: ParameterID[];
  /** Доступность при текущих параметрах системы, `undefined` означает неактуальность. */
  available: boolean | undefined;
  /** Можно ли запустить программу при её текущих параметрах, `undefined` означает загрузку. */
  runnable: boolean | undefined;
  /** Список параметров запуска. */
  parameters?: Parameter[];
  /** Каналы, необходимые для параметров. */
  channels?: ChannelDict;
  /** Количество исполняемых блоков программы. */
  linkedPropertyCount?: number;
  /** ID параметров программы, значения которых нужно брать на основе параметров системы. */
  relations?: Map</* program */ ParameterID, /* system */ ParameterID>;
  /** Нужно ли делать проверку связанных параметров. */
  checkRelations?: boolean;
}

/** Тип серверной программы: обычная программа или отчёт. */
type ProgramType = 'program' | 'report';

/** Идентификатор серверной программы. */
type ProgramID = string;
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
  /** Данные файла в двоичном виде. */
  blob?: Blob;
}
