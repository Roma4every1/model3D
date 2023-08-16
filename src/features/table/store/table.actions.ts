import { TableActions, TablesAction } from './table.reducer';


/** Добавить новую таблицу в хранилище состояний. */
export function createTableState(payload: FormStatePayload): TablesAction {
  return {type: TableActions.CREATE, payload};
}

/** Установить состояние колонок таблицы. */
export function setTableColumns(id: FormID, columns: TableColumnsState): TablesAction {
  return {type: TableActions.SET_COLUMNS, payload: {id, columns}};
}

/** Установить состояние дерева колонок. */
export function setTableColumnTree(id: FormID, tree: ColumnTree): TablesAction {
  return {type: TableActions.SET_COLUMN_TREE, payload: {id, tree}};
}

/** Установить глобальные настройки колонок. */
export function setTableColumnsSettings(id: FormID, settings: TableColumnsSettings): TablesAction {
  return {type: TableActions.SET_COLUMNS_SETTINGS, payload: {id, settings}};
}

/** Установить состояние выделение таблицы. */
export function setTableSelection(id: FormID, selection: TableSelection): TablesAction {
  return {type: TableActions.SET_SELECTION, payload: {id, selection}};
}

/** Установить активную ячейку таблицы. */
export function setTableActiveCell(id: FormID, cell: TableActiveCell): TablesAction {
  return {type: TableActions.SET_ACTIVE_CELL, payload: {id, cell}};
}

/** Начать редактирование таблицы. */
export function startTableEditing(id: FormID, columnID: string, recordID: number, isNew: boolean): TablesAction {
  return {type: TableActions.START_EDITING, payload: {id, columnID, recordID, isNew}};
}

/** Завершить редактирование таблицы. */
export function endTableEditing(id: FormID): TablesAction {
  return {type: TableActions.END_EDITING, payload: id};
}

/** Ресет некоторых свойств при обновлении данных канала. */
export function resetTable(id: FormID, tableID: TableID, channelData: ChannelData): TablesAction {
  return {type: TableActions.RESET, payload: {id, tableID, channelData}};
}

/** Очистить состояние табличных форм. */
export function clearTables(): TablesAction {
  return {type: TableActions.CLEAR};
}
