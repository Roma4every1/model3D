import { useTableStore } from './table.store';
import { applyColumnTypes, settingsToTableState } from '../lib/initialization';
import { getFlatten } from '../lib/column-tree';


/** Добавить новую таблицу в хранилище состояний. */
export function createTableState(payload: FormStatePayload): void {
  const id = payload.state.id;
  useTableStore.setState({[id]: settingsToTableState(payload)});
}

/** Установить состояние колонок таблицы. */
export function setTableColumns(id: FormID, columns: TableColumnsState): void {
  const state = useTableStore.getState()[id];
  state.recordHandler.setColumns(columns);
  useTableStore.setState({[id]: {...state, columns}});
}

/** Установить состояние дерева колонок. */
export function setTableColumnTree(id: FormID, tree: ColumnTree): void {
  const state = useTableStore.getState()[id];
  const columnTreeFlatten = getFlatten(tree);
  useTableStore.setState({[id]: {...state, columnTree: tree, columnTreeFlatten}});
}

/** Установить глобальные настройки колонок. */
export function setTableColumnsSettings(id: FormID, settings: TableColumnsSettings): void {
  const state = useTableStore.getState()[id];
  useTableStore.setState({[id]: {...state, columnsSettings: settings}});
}

/** Установить состояние выделение таблицы. */
export function setTableSelection(id: FormID, selection: TableSelection): void {
  const state = useTableStore.getState()[id];
  const activeCell = state.activeCell;
  const selectedRecords = Object.keys(selection);

  if (activeCell.recordID !== null && selectedRecords.length > 1) {
    const activeRecord = activeCell.recordID.toString();
    if (!selectedRecords.includes(activeRecord)) activeCell.recordID = null;
  }
  useTableStore.setState({[id]: {...state, selection}});
}

/** Установить активную ячейку таблицы. */
export function setTableActiveCell(id: FormID, cell: TableActiveCell): void {
  const state = useTableStore.getState()[id];
  const recordID = cell.recordID;

  if (recordID !== null && !state.selection[recordID]) {
    state.selection = {[recordID]: true};
  }
  useTableStore.setState({[id]: {...state, activeCell: cell}});
}

/** Начать редактирование таблицы. */
export function startTableEditing(id: FormID, columnID: string, recordID: number, isNew: boolean): void {
  const selection: TableSelection = {[recordID]: true};
  const edit: TableEditState = {isNew, modified: isNew};
  const activeCell: TableActiveCell = {columnID, recordID, edited: true};

  const state = useTableStore.getState()[id];
  useTableStore.setState({[id]: {...state, selection, activeCell, edit}});
}

/** Завершить редактирование таблицы. */
export function endTableEditing(id: FormID): void {
  const state = useTableStore.getState()[id];

  if (state.edit.isNew) {
    state.selection = {};
    state.activeCell.recordID = null;
  }
  const edit = {isNew: false, modified: false};
  const activeCell = {...state.activeCell, edited: false};
  useTableStore.setState({[id]: {...state, edit, activeCell}});
}

/** Ресет некоторых свойств при обновлении данных канала. */
export function resetTable(id: FormID, channelData: ChannelData): void {
  const state = useTableStore.getState()[id];
  const queryID = channelData?.queryID;
  const total = channelData?.rows.length ?? 0;
  const editable = channelData?.editable ?? state.editable;

  if (state.total !== total || state.activeCell.edited || state.edit.isNew) {
    state.total = total;
    state.selection = {};
    state.activeCell = {columnID: null, recordID: null, edited: false};
  }
  if (channelData?.columns) {
    applyColumnTypes(state, channelData.columns);
    state.recordHandler.setColumns(state.columns, channelData.columns);
  }

  const edit = {modified: false, isNew: false};
  useTableStore.setState({[id]: {...state, queryID, editable, edit}});
}
