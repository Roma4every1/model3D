/** Словарь каналов. */
type ChannelDict = Record<ChannelName, Channel>;
/** Словарь записей каналов. */
type ChannelRecordDict = Record<ChannelName, ChannelRecord[]>;

/** Модель канала данных.
 * + `name`: {@link ChannelName}
 * + `info`: {@link ChannelInfo}
 * + `data`: {@link ChannelData}
 * + `query`: {@link ChannelQuerySettings}
 * */
interface Channel {
  /** Уникальное название канала. */
  readonly name: ChannelName;
  /** Информация о канале. */
  readonly info: ChannelInfo;
  /** Данные из базы. */
  data: ChannelData | null;
  /** Настройки запроса данных. */
  query: ChannelQuerySettings;
}

/** Идентификатор канала с данными. */
type ChannelName = string;
/** ID для API редактирования записей. */
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
/** Название колонки канала; всегда имеет верхний регистр. */
type ColumnName = string;

/** Тип данных колонки канала.
 * @example
 * "System.Int32"
 * "System.Decimal"
 * "System.String"
 * "System.Byte[]"
 * */
type ColumnType = string;

/** Информация о канале, не меняющаяся в течение сессии.
 * + `displayName`: string
 * + `parameters`: {@link ParameterID}[]
 * + `properties`: {@link ChannelProperty}[]
 * + `currentRowObjectName`: {@link ParameterID}
 * + `clients`: {@link Set} of {@link FormID}
 * + `lookupChannels`: {@link ChannelName}[]
 * + `columns`: {@link ChannelColumnInfo}
 * + `lookupColumns`: {@link LookupColumns}
 * + `columnApplied: boolean`
 * */
interface ChannelInfo {
  /** Название для отображения на интерфейсе. */
  readonly displayName: string;
  /** Параметры канала. */
  readonly parameters: ParameterID[];
  /** Свойства канала. */
  readonly properties: ChannelProperty[];
  /** ID параметра, к которому привязан канал. */
  readonly currentRowObjectName: ParameterID;
  /** ID форм, в которых лежат необходимые параметры. */
  clients?: Set<ClientID>;
  /** Список каналов справочников. */
  lookupChannels?: ChannelName[];
  /** Информация о названиях и индексах колонок. */
  columns?: ChannelColumnInfo;
  /** Названия колонок, необходимых для справочников. */
  lookupColumns?: LookupColumns;
  /** Были ли полученны данные о колонках канала. */
  columnApplied?: boolean;
}

/** Дополнительные свойства колонки. */
interface ChannelProperty {
  /** Название свойства. */
  name: string;
  /** Тип данных связанной колонки. */
  type?: ColumnType;
  /** Какой колонке относится. */
  readonly fromColumn: ColumnName;
  /** Название для отображения на интерфейсе. */
  readonly displayName: string;
  /** Группировка относительно других колонок. */
  readonly treePath: string[];
  /** Канал-справочник. */
  readonly lookupChannels: ChannelName[];
  /** Название канала для привязанной таблицы. */
  readonly secondLevelChannelName?: ChannelName;
  /** Информация для свойства связанного с файлами. */
  readonly file?: {nameFrom: string, fromResources: boolean};
}

/** Информация о колонках, необходимых для справочников.
 * + `id`: {@link LookupColumnInfo}
 * + `value`: {@link LookupColumnInfo}
 * + `parent`: {@link LookupColumnInfo}
 * */
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
type ChannelColumnCriterion = string | {name: string, optional: boolean};

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
 * */
interface SortOrderItem {
  /** Название колонки. */
  column: ColumnName;
  /** Направление сортировки. */
  direction: SortOrderDirection;
}

/** Направление порядка.
 * + `asc`  — в порядке возрастания
 * + `desc` — в порядке убывания
 * */
type SortOrderDirection = 'asc' | 'desc';

/* --- Lookup --- */

/** Список возможных значений из канала-справочника. */
type LookupList = LookupListItem[];

/** Значение из канала справочника.
 * + `id: any`
 * + `value: any`
 * */
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
 * */
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
