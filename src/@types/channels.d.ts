interface Channel {
  id: ChannelName,
  displayName: string,
  currentRowObjectName: string | null,
  data: ChannelData | null,
  idIndex: number,
  nameIndex: number,
  parentIndex: number,
  properties: ChannelProperty[],
  tableId: string,
}

/* --- ^ OLD ^ --- */

interface Channel_ {
  /** Информация о канале. */
  info: ChannelInfo,
  /** Данные из базы. */
  data: ChannelData,
}

/** Информация о канале, не меняющаяся в течение сессии. */
interface ChannelInfo {
  /** Название для отображения на интерфейсе. */
  displayName: string,
  /** Параметры канала. */
  parameters: ParameterID[],
  /** Свойства канала. */
  properties: ChannelProperty[],
  /** ID параметра, к которому привязан канал. */
  currentRowObjectName: string,
}

/* --- Channel Data --- */

/** Данные канала. */
interface ChannelData {
  /** Список записей. */
  Rows: ChannelRow[],
  /** Список колонок. */
  Columns: ChannelColumn[],
  /** Выданы ли все данные. */
  DataPart: boolean,
  /** Являются ли данные редактируемыми. */
  Editable: boolean,
  ModifiedTables: any,
  PrimaryColumn: any,
  TotalsRows: any,
  /** ID для API редактирования записей. */
  tableID: TableID,
}

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

/* --- Channel Property --- */

/** Дополнительные свойства колонки. */
interface ChannelProperty {
  /** Название свойства. */
  name: string,
  /** Какой колонке относится. */
  fromColumn: string,
  /** Название для отображения на интерфейсе. */
  displayName: string,
  treePath: string[],
  lookupChannelName: string | null,
  /** Название канала для привязанной таблицы. */
  secondLevelChannelName: string | null,
  lookupData?: LookupDataItem[],
}

interface LookupDataItem {
  id: any,
  value: any,
  text: any,
  parent?: any,
}
