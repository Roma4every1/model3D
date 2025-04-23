/** Словарь каналов. */
type ChannelDict = Record<ChannelID, Channel>;
/** Словарь записей каналов. */
type ChannelRecordDict = Record<ChannelID, ChannelRecord[]>;

/** Канал данных. */
interface Channel {
  /** Идентификатор канала. */
  readonly id: ChannelID;
  /** Название канала. */
  readonly name: ChannelName;
  /** Конфигурация канала. */
  readonly config: ChannelConfig;
  /** Настройки запроса данных. */
  readonly query: ChannelQuerySettings;
  /** Данные из базы. */
  data: ChannelData | null;
  /** Флаг актуальности данных. */
  actual: boolean;
}

/** Идентификатор канала. */
type ChannelID = number;
/** Название канала. */
type ChannelName = string;
/** ID, который используется в серверных запросах редактирования данных. */
type QueryID = string;

/** Данные канала. */
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

/**
 * Название типа данных колонки.
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
  /** Названия колонок, необходимых для справочников. */
  readonly lookupColumns: LookupColumns;
  /** Названия параметров канала. */
  readonly parameterNames: ReadonlyArray<ParameterName>;
  /** Название параметра активной записи канала. */
  readonly activeRowParameterName: ParameterName | null;
  /** ID параметров канала. */
  parameters?: ParameterID[];
  /** ID параметра активной записи канала. */
  activeRowParameter?: ParameterID;
}

/** Дополнительные свойства колонки. */
interface ChannelProperty {
  /** Название свойства. */
  readonly name: PropertyName;
  /** Какой колонке относится. */
  readonly fromColumn: ColumnName;
  /** Название для отображения на интерфейсе. */
  readonly displayName?: string;
  /** Путь в дереве свойств. */
  readonly treePath: string[];
  /** Названия каналов-справочников. */
  readonly lookupChannelNames: ReadonlyArray<ChannelName>;
  /** Название канала детализации. */
  readonly detailChannelName?: ChannelName;
  /** Информация для свойства связанного с файлами. */
  readonly file?: {nameFrom: PropertyName, fromResources?: boolean};
  /** Форматирование значений. */
  readonly format?: string;
  /** ID каналов-справочников. */
  lookupChannels?: ChannelID[];
  /** ID канала детализации. */
  detailChannel?: ChannelID;
}

/** Название свойства канала. */
type PropertyName = string;

/** Статистика по колонке датасета. */
interface ColumnStat {
  /** Минимальное значение. */
  min?: number | string;
  /** Максимальное значение. */
  max?: number | string;
  /** Среднее значение. */
  avg?: number | string;
  /** Сумма всех значений. */
  sum?: number | string;
  /** Количество значений. */
  count?: number | string;
  /** Количество уникальных значений. */
  unique?: number | string;
}

/* --- Criterion --- */

/** Критерий канала. */
interface ChannelCriterion<P extends string = string> {
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
  lookups?: PropertyLookupCriteria;
  /** Свойство должно иметь указанный канал детализации. */
  details?: PropertyChannelCriterion;
  /**
   * Является ли свойство обязательным.
   * @default true
   */
  required?: boolean;
}

/** Критерий справочника свойства или канала детализации. */
type PropertyChannelCriterion<T = string> = ChannelCriterion<T> & {required?: boolean};
/** Критерии для справочников свойства. */
type PropertyLookupCriteria<T extends string = string> = Record<T, PropertyChannelCriterion>;

/* --- Info --- */

/** Модель прикреплённого канала. */
interface AttachedChannel<T extends string = string> {
  /** Идентификатор канала. */
  readonly id: ChannelID;
  /** Название канала. */
  readonly name: ChannelName;
  /** Прикреплённые свойства канала. */
  readonly attachedProperties: ChannelProperty[];
  /** Тип прикреплённого канала. */
  type?: T;
  /** Информация о структуре данных канала. */
  info?: ChannelRecordInfo;
  /** Дополнительная информация о канале, необходимая клиенту для работы. */
  config?: any;
}

/** Информация о колонках, необходимых для справочников. */
type LookupColumns = ChannelRecordInfo<'id' | 'value' | 'parent'>;

/** Информация о структуре данных канала. */
type ChannelRecordInfo<T extends string = string> = Record<T, RecordPropertyInfo>;

/** Информация о свойстве записи канала. */
interface RecordPropertyInfo<L extends string = string> {
  /** Название свойства канала. */
  readonly propertyName: PropertyName;
  /** Название колонки в датасете. */
  readonly columnName?: ColumnName;
  /** Индекс колонки в датасете. */
  columnIndex?: number;
  /** Название типа данных значения. */
  dataType?: DataTypeName;
  /** Информация о справочниках. */
  lookups?: RecordLookupInfo<L>;
  /** Информация о канале детализации. */
  details?: PropertyAttachedChannel;
}

type PropertyAttachedChannel = {id: ChannelID, info: ChannelRecordInfo};
/** Информация о справочниках свойства. */
type RecordLookupInfo<T extends string = string> = Record<T, PropertyAttachedChannel>;

/* --- Query Settings --- */

/** Настройки запроса данных. */
interface ChannelQuerySettings {
  /** Фильтры. */
  filter?: FilterNode;
  /** Порядок сортировки строк. */
  order?: SortOrder;
  /** Ограничитель количества записей. */
  limit?: ChannelLimit;
}

/**
 * Ограничение количества записей в канале.
 * + число — ограничение конкретным количеством записей
 * + `false` — запрос всех записей, независимо от конфига канала
 * + `null` — не применять фильтр, результат зависит от конфига канала
 */
type ChannelLimit = number | false | null;

/** Порядок сортировки. */
type SortOrder = SortOrderItem[];

/**
 * Элемент порядка сортировки.
 * + `column`: {@link ColumnName}
 * + `direction`: {@link SortOrderDirection}
 */
interface SortOrderItem {
  /** Название колонки. */
  column: ColumnName;
  /** Направление сортировки. */
  direction: SortOrderDirection;
}

/**
 * Направление порядка.
 * + `asc`  — в порядке возрастания
 * + `desc` — в порядке убывания
 */
type SortOrderDirection = 'asc' | 'desc';

/** Узел выражения фильтра. */
type FilterNode = FilterNodeOr | FilterNodeAnd | FilterNodeLeaf;
/** Узел выражения фильтра, обозначающий логическое "или". */
type FilterNodeOr = IFilterNode<'or', FilterNode[]>;
/** Узел выражения фильтра, обозначающий логическое "и". */
type FilterNodeAnd = IFilterNode<'and', FilterNode[]>;

/** Лист выражения фильтра. */
type FilterNodeLeaf = IFilterNode<FilterLeafType, FilterLeafValue>;
/** Значение листового узла выражения фильтра. */
type FilterLeafValue = Date | string | number | boolean | null;

/** Тип узла выражения фильтра. */
type FilterNodeType = 'or' | 'and' | FilterLeafType;
/** Типы листьев выражения фильтра. */
type FilterLeafType = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'starts' | 'ends' | 'contains';

interface IFilterNode<T extends FilterNodeType, V> {
  type: T;
  column?: ColumnName;
  value: V;
}

/* --- Lookup --- */

/** Список возможных значений из канала-справочника. */
type LookupList = LookupListItem[];

/** Значение из канала справочника. */
interface LookupListItem {
  /** Идентификатор; обычно число. */
  id: LookupItemID;
  /** Значение; обычно строка. */
  value: any;
}

/** Дерево возможных значений из канала-справочника. */
type LookupTree = LookupTreeNode[];

/** Элемент дерева значений канала-справочника. */
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

/** Ассоциативный массив значений канала-справочника. */
type LookupMap<T = any> = Map<LookupItemID, T>;
/** Словарь значений канала-справочника. */
type LookupDict<T = any> = Record<LookupItemID, T>;

/** Идентификатор значения из канала-справочника. */
type LookupItemID = number | string;
