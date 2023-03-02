/** Идентификатор канала с данными. */
type ChannelName = string;

/** Данные каналов. */
type ChannelDict = Record<ChannelName, Channel>;

/** Модель канала данных.
 * + `tableID`: {@link TableID}
 * + `data`: {@link ChannelData}
 * + `info`: {@link ChannelInfo}
 * + `query`: {@link ChannelQuerySettings}
 * */
interface Channel {
  /** ID для API редактирования записей. */
  tableID: TableID,
  /** Данные из базы. */
  data: ChannelData | null,
  /** Информация о канале. */
  info: ChannelInfo,
  /** Настройки запроса данных. */
  query: ChannelQuerySettings,
}

/** ID для API редактирования записей. */
type TableID = string;

/** Данные канала.
 * + `columns`: {@link ChannelColumn}[]
 * + `rows`: {@link ChannelRow}[]
 * + `dataPart: boolean`
 * + `editable: boolean`
 * */
interface ChannelData {
  /** Список колонок. */
  columns: ChannelColumn[],
  /** Список записей. */
  rows: ChannelRow[],
  /** Выданы ли все данные. */
  dataPart: boolean,
  /** Являются ли данные редактируемыми. */
  editable: boolean,
}

/** Запись из данных канала. */
interface ChannelRow {
  ID: number | null,
  Cells: any[],
}

/** Информация о столбце в SQL-таблице. */
interface ChannelColumn {
  /** Название колонки. */
  Name: string,
  /** Тип данных. */
  NetType: string,
  /** Разрешён ли `NULL` в качестве значения. */
  AllowDBNull: boolean
}

/** Информация о канале, не меняющаяся в течение сессии.
 * + `displayName`: {@link DisplayName}
 * + `parameters`: {@link ParameterID}[]
 * + `properties`: {@link ChannelProperty}[]
 * + `currentRowObjectName`: {@link ParameterID}
 * + `clients`: {@link Set} of {@link FormID}
 * + `lookupChannels`: {@link ChannelName}[]
 * + `lookupColumns`: {@link LookupColumns}
 * */
interface ChannelInfo {
  /** Название для отображения на интерфейсе. */
  displayName: DisplayName,
  /** Параметры канала. */
  parameters: ParameterID[],
  /** Свойства канала. */
  properties: ChannelProperty[],
  /** ID параметра, к которому привязан канал. */
  currentRowObjectName: ParameterID,
  /** ID форм, в которых лежат необходимые параметры. */
  clients?: Set<FormID>,
  /** Список каналов справочников. */
  lookupChannels?: ChannelName[],
  /** Названия колонок, необходимых для редакторов параметров. */
  lookupColumns?: LookupColumns,
}

/** Дополнительные свойства колонки. */
interface ChannelProperty {
  /** Название свойства. */
  name: string,
  /** Какой колонке относится. */
  fromColumn: string,
  /** Название для отображения на интерфейсе. */
  displayName: string,
  /** Группировка относительно других колонок. */
  treePath: string[],
  /** Канал-справочник. */
  lookupChannelName: string | null,
  /** Название канала для привязанной таблицы. */
  secondLevelChannelName: string | null,
}

/** Информация о колонках, необходимых для редакторов параметров.
 * + `id`: {@link LookupColumnInfo}
 * + `value`: {@link LookupColumnInfo}
 * + `parent`: {@link LookupColumnInfo}
 * */
interface LookupColumns {
  /** Название и индекс колонки с идентификаторами. */
  id: LookupColumnInfo,
  /** Название и индекс колонки со значениями. */
  value: LookupColumnInfo,
  /** Название и индекс колонки с ID родителей. */
  parent: LookupColumnInfo,
}

/** Информация о колонке канала необходимой для редакторов параметров. */
interface LookupColumnInfo {
  /** Название колонки. */
  name: string,
  /** Порядковый номер. */
  index: number,
}

/** Настройки запроса данных. */
interface ChannelQuerySettings {
  /** Ограничение по количеству строк. */
  maxRowCount: number | null,
  /** Порядок строк. */
  order: any[] | null,
  /** Фильтры. */
  filters: any[] | null,
}

/** Набор пар канал-данные. */
type ChannelDataEntries = [ChannelName, ChannelData][];

/* --- Lookup --- */

/** Список возможных значений из канала-справочника. */
type LookupList = LookupListItem[];

/** Значение из канала справочника.
 * + `id: any`
 * + `value: any`
 * */
interface LookupListItem {
  /** Идентификатор; обычно число. */
  id: LookupItemID,
  /** Значение; обычно строка. */
  value: any,
}

/** Дерево возможных значений из канала-справочника. */
type LookupTree = LookupTreeNode[];

/** Элемент дерева значений канала-справочника.
 * + `id: any`
 * + `value: any`
 * + `children?`: {@link LookupTreeNode}[]
 * */
interface LookupTreeNode {
  /** Идентификатор; обычно число. */
  id: LookupItemID,
  /** Значение; обычно строка. */
  value: any,
  /** Идентификатор родителя. */
  parent?: LookupItemID,
  /** Дочерние элементы. */
  children?: LookupTreeNode[],
}

/** Словарь данных канала-справочника. */
type LookupDict = Record<LookupItemID, any>;

/** Идентификатор значения из канала-справочника. */
type LookupItemID = number | string;
