/** Идентификатор канала с данными. */
type ChannelName = string;

/** Данные каналов. */
type ChannelDict = Record<ChannelName, Channel>;

/** Модель канала данных.
 * + `info`: {@link ChannelInfo}
 * + `data`: {@link ChannelData}
 * + `tableID`: {@link TableID}
 * */
interface Channel {
  /** Информация о канале. */
  info: ChannelInfo,
  /** Данные из базы. */
  data: ChannelData | null,
  /** ID для API редактирования записей. */
  tableID: TableID,
  /** Фильтры. */
  filters?: any[],
}

/** Информация о канале, не меняющаяся в течение сессии.
 * + `displayName`: {@link DisplayName}
 * + `parameters`: {@link ParameterID}[]
 * + `properties`: {@link ChannelProperty}[]
 * + `currentRowObjectName: string`
 * + `editorColumns?`: {@link EditorColumns}
 * + `clients`: {@link Set} of {@link FormID}
 * */
interface ChannelInfo {
  /** Название для отображения на интерфейсе. */
  displayName: DisplayName,
  /** Параметры канала. */
  parameters: ParameterID[],
  /** Свойства канала. */
  properties: ChannelProperty[],
  /** ID параметра, к которому привязан канал. */
  currentRowObjectName: string,
  /** ID форм, в которых лежат необходимые параметры. */
  clients?: Set<FormID>,
  /** Названия колонок, необходимых для редакторов параметров. */
  editorColumns?: EditorColumns,
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
  /** ??? */
  lookupChannelName: string | null,
  /** Название канала для привязанной таблицы. */
  secondLevelChannelName: string | null,
}

/** Информация о колонках, необходимых для редакторов параметров.
 * + `lookupCode`: {@link EditorColumnInfo}
 * + `lookupValue`: {@link EditorColumnInfo}
 * + `lookupParentCode`: {@link EditorColumnInfo}
 * */
interface EditorColumns {
  lookupCode: EditorColumnInfo,
  lookupValue: EditorColumnInfo,
  lookupParentCode: EditorColumnInfo,
}

/** Информация о колонке канала необходимой для редакторов параметров. */
interface EditorColumnInfo {
  /** Название колонки. */
  name: string,
  /** Порядковый номер. */
  index: number,
}

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
  ID: any,
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

/** ID для API редактирования записей. */
type TableID = string;

/** Набор пар канал-данные. */
type ChannelDataEntries = [ChannelName, ChannelData][];
