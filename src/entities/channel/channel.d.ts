/** Словарь каналов. */
type ChannelDict = Record<ChannelName, Channel>;
/** Словарь записей каналов. */
type ChannelRecordDict = Record<ChannelName, ChannelRecord[]>;

/** Модель канала.
 * + `name`: {@link ChannelName}
 * + `config`: {@link ChannelConfig}
 * + `data`: {@link ChannelData}
 * + `query`: {@link ChannelQuerySettings}
 */
interface Channel {
  /** Уникальное название канала. */
  readonly name: ChannelName;
  /** Конфигурация канала. */
  readonly config: ChannelConfig;
  /** Данные из базы. */
  data: ChannelData | null;
  /** Настройки запроса данных. */
  query: ChannelQuerySettings;
}

/** Идентификатор канала с данными. */
type ChannelName = string;
/** ID, который используется в серверных запросах редактирования данных. */
type QueryID = string;

/** Данные канала.
 * + `queryID`: {@link QueryID}
 * + `columns`: {@link ChannelColumn}[]
 * + `rows`: {@link ChannelRow}[]
 * + `dataPart: boolean`
 * + `editable: boolean`
 * + `activeRow`: {@link ChannelRow}
 */
interface ChannelData {
  /** ID для API редактирования записей. */
  readonly queryID: QueryID;
  /** Список колонок. */
  readonly columns: ChannelColumn[];
  /** Список записей. */
  readonly rows: ChannelRow[];
  /** Выданы ли все данные. */
  readonly dataPart: boolean;
  /** Являются ли данные редактируемыми. */
  readonly editable: boolean;
  /** Активная строка. */
  activeRow?: ChannelRow;
}

/** Информация о столбце в SQL-таблице. */
interface ChannelColumn {
  /** Название колонки. */
  readonly name: ColumnName;
  /** Тип данных. */
  readonly type: ColumnType;
  /** Разрешён ли `null` в качестве значения. */
  readonly nullable: boolean;
}

/** Упорядоченный набор ячеек. */
type ChannelRow = any[];

/** Словарь значений по названиям **колонок**. */
type ChannelRecord = Record<ColumnName, any>;
/** Название колонки в датасете. */
type ColumnName = string;

/** Название типа данных колонки.
 * @example
 * "i32"
 * "System.String"
 * "System.Byte[]"
 */
type ColumnType = string;

/** Информация о канале, не меняющаяся в течение сессии. */
interface ChannelConfig {
  /** Название для отображения на интерфейсе. */
  readonly displayName: string;
  /** Свойства канала. */
  readonly properties: ChannelProperty[];
  /** Параметры канала. */
  readonly parameters: ParameterID[];
  /** Список каналов справочников. */
  readonly lookupChannels: ChannelName[];
  /** Названия колонок, необходимых для справочников. */
  readonly lookupColumns: LookupColumns;
  /** Название параметра активной записи канала. */
  readonly activeRowParameter?: ParameterID;
  /** ID форм, в которых лежат необходимые параметры. */
  clients?: Set<ClientID>;
  /** Были ли полученны данные о колонках канала. */
  columnApplied?: boolean;
}

/** Дополнительные свойства колонки. */
interface ChannelProperty {
  /** Название свойства. */
  readonly name: string;
  /** Какой колонке относится. */
  readonly fromColumn: ColumnName;
  /** Название для отображения на интерфейсе. */
  readonly displayName?: string;
  /** Путь в дереве свойств. */
  readonly treePath: string[];
  /** Названия каналов-справочников. */
  readonly lookupChannels: ChannelName[];
  /** Название канала для привязанной таблицы. */
  readonly detailChannel?: ChannelName;
  /** Информация для свойства связанного с файлами. */
  readonly file?: {nameFrom: string, fromResources?: boolean};
  /** Тип данных связанной колонки. */
  type?: ColumnType;
}

/** Информация о колонках, необходимых для справочников.
 * + `id`: {@link LookupColumnInfo}
 * + `value`: {@link LookupColumnInfo}
 * + `parent`: {@link LookupColumnInfo}
 */
interface LookupColumns {
  /** Название и индекс колонки с идентификаторами. */
  id: LookupColumnInfo;
  /** Название и индекс колонки со значениями. */
  value: LookupColumnInfo;
  /** Название и индекс колонки с ID родителей. */
  parent: LookupColumnInfo;
}

/** Информация о названиях и индексах колонок канала. */
type ChannelColumnInfo<Fields = string> = Record<Fields, LookupColumnInfo>;

/** Информация о названии и индексе колонки. */
interface LookupColumnInfo {
  /** Название колонки. */
  name: ColumnName;
  /** Порядковый номер. */
  index: number;
}

type ChannelCriterion<Fields extends string = string> = Record<Fields, ChannelColumnCriterion>;
type ChannelColumnCriterion = {name: string, optional?: boolean};

/** Критерий канала. */
interface ChannelCriterion2<P extends string = string> {
  /** Условие на название. */
  name?: StringMatcher;
  /** Условие на свойства. */
  properties?: ChannelPropertyCriteria<P>;
}

/** Критерии свойств канала. */
type ChannelPropertyCriteria<P = string> = Record<P, ChannelPropertyCriterion>;

/** Критерий свойства канала. */
interface ChannelPropertyCriterion {
  /** Название свойства должно совпадать с указанными паттерном. */
  name?: StringMatcher;
  /** Свойство должно ссылаться колонку с бинарным типом. */
  binary?: boolean;
  /** Свойство должно иметь указанные справочники. */
  lookups?: Record<string, ChannelCriterion2>;
  /** Свойство должно иметь указанный канал детализации. */
  details?: ChannelCriterion2;

  /** Является ли свойство обязательным.
   * @default true
   */
  required?: boolean;
}

/** Критерии для справочников свойства. */
type PropertyLookupCriteria<T extends string = string> = Record<T, ChannelCriterion2>;

/* --- Info --- */

/** Модель прикреплённого канала. */
interface AttachedChannel<R = string> {
  /** Название канала. */
  readonly name: ChannelName;
  /** Прикреплённые свойства канала. */
  readonly attachedProperties: ChannelProperty[];
  /** Тип прикреплённого канала. */
  type?: string;
  /** Информация о структуре данных канала. */
  info?: ChannelRecordInfo<R>;
  /** Дополнительная информация о канала, необходимая клиенту для работы. */
  config?: any;
}

/** Информация о структуре данных канала. */
type ChannelRecordInfo<T extends string = string> = Record<T, RecordPropertyInfo>;

/** Информация о свойстве записи канала. */
interface RecordPropertyInfo<L extends string = string> {
  /** Название свойства канала. */
  readonly propertyName: string;
  /** Название колонки в датасете. */
  readonly columnName?: ColumnName;
  /** Индекс колонки в датасете. */
  columnIndex?: number;
  /** Название типа данных значения. */
  dataType?: DataTypeName;
  /** Информация о справочниках. */
  lookups?: RecordLookupInfo<L>;
  /** Информация о канале детализации. */
  details?: ChannelRecordInfo;
}

/** Информация о справочниках свойства. */
type RecordLookupInfo<T extends string = string> = Record<T, ChannelRecordInfo>;

/* --- Query Settings --- */

/** Настройки запроса данных. */
interface ChannelQuerySettings {
  /** Фильтры. */
  filter?: any;
  /** Порядок сортировки строк. */
  order?: SortOrder;
  /** Ограничитель количества записей. */
  limit?: ChannelLimit;
}

/** Ограничение количества записей в канале.
 * + число — ограничение конкретным количеством записей
 * + `false` — запрос всех записей, независимо от конфига канала
 * + `null` — не применять фильтр, результат зависит от конфига канала
 */
type ChannelLimit = number | false | null;

/** Порядок сортировки. */
type SortOrder = SortOrderItem[];

/** Элемент порядка сортировки.
 * + `column`: {@link ColumnName}
 * + `direction`: {@link SortOrderDirection}
 */
interface SortOrderItem {
  /** Название колонки. */
  column: ColumnName;
  /** Направление сортировки. */
  direction: SortOrderDirection;
}

/** Направление порядка.
 * + `asc`  — в порядке возрастания
 * + `desc` — в порядке убывания
 */
type SortOrderDirection = 'asc' | 'desc';

/* --- Lookup --- */

/** Список возможных значений из канала-справочника. */
type LookupList = LookupListItem[];

/** Значение из канала справочника.
 * + `id: any`
 * + `value: any`
 */
interface LookupListItem {
  /** Идентификатор; обычно число. */
  id: LookupItemID;
  /** Значение; обычно строка. */
  value: any;
}

/** Дерево возможных значений из канала-справочника. */
type LookupTree = LookupTreeNode[];

/** Элемент дерева значений канала-справочника.
 * + `id`: {@link LookupItemID}
 * + `value: any`
 * + `parent?`: {@link LookupItemID}
 * + `children?`: {@link LookupTreeNode}[]
 */
interface LookupTreeNode {
  /** Идентификатор; обычно число. */
  id: LookupItemID;
  /** Значение; обычно строка. */
  value: any;
  /** Идентификатор родителя. */
  parent?: LookupItemID;
  /** Дочерние элементы. */
  children?: LookupTreeNode[];
}

/** Словарь данных канала-справочника. */
type LookupDict<T = any> = Record<LookupItemID, T>;

/** Идентификатор значения из канала-справочника. */
type LookupItemID = number | string;
