import { TableFormSettings } from '../lib/types';
import { TableActions, TablesAction } from './tables.reducer';


/** Добавить новую таблицу в хранилище состояний. */
export const createTableState = (id: FormID, channel: Channel, settings: TableFormSettings): TablesAction => {
  return {type: TableActions.CREATE, payload: {id, channel, settings}};
};

/** Установить состояние колонок таблицы. */
export const setTableColumns = (id: FormID, columns: TableColumnsState): TablesAction => {
  return {type: TableActions.SET_COLUMNS, payload: {id, columns}};
};

/** Установить состояние дерева колонок. */
export const setTableColumnTree = (id: FormID, tree: ColumnTree): TablesAction => {
  return {type: TableActions.SET_COLUMN_TREE, payload: {id, tree}};
};

/** Установить глобальные настройки колонок. */
export const setTableColumnsSettings = (id: FormID, settings: TableColumnsSettings): TablesAction => {
  return {type: TableActions.SET_COLUMNS_SETTINGS, payload: {id, settings}};
};

/** Установить состояние выделение таблицы. */
export const setTableSelection = (id: FormID, selection: TableSelection): TablesAction => {
  return {type: TableActions.SET_SELECTION, payload: {id, selection}};
};

/** Установить активную ячейку таблицы. */
export const setTableActiveCell = (id: FormID, cell: TableActiveCell): TablesAction => {
  return {type: TableActions.SET_ACTIVE_CELL, payload: {id, cell}};
};

/** Начать редактирование таблицы. */
export const startTableEditing = (id: FormID, columnID: string, recordID: number, isNew: boolean): TablesAction => {
  return {type: TableActions.START_EDITING, payload: {id, columnID, recordID, isNew}};
};

/** Завершить редактирование таблицы. */
export const endTableEditing = (id: FormID): TablesAction => {
  return {type: TableActions.END_EDITING, payload: id};
};

/** Ресет некоторых свойств при обновлении данных канала. */
export const resetTable = (id: FormID, tableID: TableID, channelData: ChannelData): TablesAction => {
  return {type: TableActions.RESET, payload: {id, tableID, channelData}};
};
