import { settingsToTableState } from '../lib/initialization';
import { useTableStore } from './table.store';
import { updateActiveRecord } from './table.thunks';


/** Добавить новую таблицу в хранилище состояний. */
export function createTableState(payload: FormStatePayload): void {
  const id = payload.state.id;
  useTableStore.setState({[id]: settingsToTableState(payload)});
}

/** Не меняя фактическое состояние формы вызывает рендер зависящих компонентов. */
export function updateTableState(id: FormID): void {
  const state = useTableStore.getState()[id];
  useTableStore.setState({[id]: {...state}});
}

/* --- --- */

export function setTableChannelData(id: FormID, channelData: ChannelData): void {
  const state = useTableStore.getState()[id];
  const { data, columns, selection, viewport } = state;

  const oldTotal = data.records.length;
  data.setChannelData(channelData);
  const newTotal = data.records.length;

  if (newTotal !== oldTotal) {
    selection.clear();
    data.setActiveCell(null);
    updateActiveRecord(id, null).then();
  } else if (newTotal && !channelData.activeRow) {
    updateActiveRecord(id, data.activeCell.row).then();
  }
  columns.updateAutoWidth(data.records);
  viewport.handleDataChange();
  useTableStore.setState({[id]: {...state}});
}

export function setTableLookupData(id: FormID, lookupData: ChannelDict): void {
  const state = useTableStore.getState()[id];
  state.data.setLookupData(lookupData);
  useTableStore.setState({[id]: {...state}});
}

export function setTableHeaderValues(id: FormID, values: any[]): void {
  const state = useTableStore.getState()[id];
  state.columns.setHeaderValues(values);
  state.columns.updateAutoWidth(state.data.records);
  useTableStore.setState({[id]: {...state}});
}

/* --- --- */

export function setTableActiveCell(id: FormID, cell: TableActiveCell): void {
  const state = useTableStore.getState()[id];
  state.data.setActiveCell(cell);
  useTableStore.setState({[id]: {...state}});

  const { row, column } = state.data.activeCell;
  if (row !== null && column !== null) state.viewport.scrollCellIntoView(row, column);
}

export function setTableColumnWidth(id: FormID, column: PropertyName, width: number): void {
  const state = useTableStore.getState()[id];
  state.columns.setColumnWidth(column, width, state.data.records);
  useTableStore.setState({[id]: {...state}});
}

export function setTableColumnFixed(id: FormID, column: PropertyName, fixed: boolean): void {
  const state = useTableStore.getState()[id];
  state.columns.setColumnFixed(column, fixed);
  useTableStore.setState({[id]: {...state}});
}

export function moveTableColumn(id: FormID, col: PropertyName, to: string): void {
  const state = useTableStore.getState()[id];
  state.columns.moveColumn(col, to);

  const { row, column } = state.data.activeCell;
  if (row !== null) state.viewport.scrollCellIntoView(row, column);
  useTableStore.setState({[id]: {...state}});
}

export function setTableVisibleColumns(id: FormID, columns: PropertyName[]): void {
  const state = useTableStore.getState()[id];
  state.columns.setVisibleColumns(columns, state.data.records);

  if (!columns.includes(state.data.activeCell.column)) {
    state.data.setActiveCell(null);
    updateActiveRecord(id, null).then();
  }
  useTableStore.setState({[id]: {...state}});
}
