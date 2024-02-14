import { getFlatten } from '../lib/column-tree';
import { settingsToTableState, applyColumnTypes } from '../lib/initialization';

/* --- Action Types --- */

export enum TableActionType {
  CREATE = 'tables/create',
  SET_COLUMNS = 'tables/columns',
  SET_COLUMN_TREE = 'tables/tree',
  SET_COLUMNS_SETTINGS = 'tables/settings',
  SET_SELECTION = 'tables/selection',
  SET_ACTIVE_CELL = 'tables/cell',
  START_EDITING = 'tables/start',
  END_EDITING = 'tables/end',
  RESET = 'tables/reset',
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: TableActionType.CREATE;
  payload: FormStatePayload;
}
interface ActionSetColumns {
  type: TableActionType.SET_COLUMNS;
  payload: {id: FormID, columns: TableColumnsState};
}
interface ActionSetColumnTree {
  type: TableActionType.SET_COLUMN_TREE;
  payload: {id: FormID, tree: ColumnTree};
}
interface ActionSetColumnSettings {
  type: TableActionType.SET_COLUMNS_SETTINGS;
  payload: {id: FormID, settings: TableColumnsSettings};
}
interface ActionSetSelection {
  type: TableActionType.SET_SELECTION;
  payload: {id: FormID, selection: TableSelection};
}
interface ActionSetActiveCell {
  type: TableActionType.SET_ACTIVE_CELL;
  payload: {id: FormID, cell: TableActiveCell};
}
interface ActionStartEditing {
  type: TableActionType.START_EDITING;
  payload: {id: FormID, columnID: TableColumnID, recordID: TableRecordID, isNew: boolean};
}
interface ActionEndEditing {
  type: TableActionType.END_EDITING;
  payload: FormID;
}
interface ActionReset {
  type: TableActionType.RESET;
  payload: {id: FormID, tableID: TableID, channelData: ChannelData};
}

export type TablesAction = ActionCreate | ActionSetColumns | ActionSetColumnTree |
  ActionSetColumnSettings | ActionSetSelection | ActionSetActiveCell |
  ActionStartEditing | ActionEndEditing | ActionReset;

/* --- Init State & Reducer --- */

const init: TableStates = {};

export const tablesReducer = (state: TableStates = init, action: TablesAction): TableStates => {
  switch (action.type) {

    case TableActionType.CREATE: {
      const id = action.payload.state.id;
      return {...state, [id]: settingsToTableState(action.payload)};
    }

    case TableActionType.SET_COLUMNS: {
      const { id, columns } = action.payload;
      const tableState = state[id];
      tableState.recordHandler.setColumns(columns);
      return {...state, [id]: {...tableState, columns}};
    }

    case TableActionType.SET_COLUMN_TREE: {
      const { id, tree } = action.payload;
      const columnTreeFlatten = getFlatten(tree);
      return {...state, [id]: {...state[id], columnTree: tree, columnTreeFlatten}};
    }

    case TableActionType.SET_COLUMNS_SETTINGS: {
      const { id, settings } = action.payload;
      return {...state, [id]: {...state[id], columnsSettings: settings}};
    }

    case TableActionType.SET_SELECTION: {
      const { id, selection } = action.payload;
      const tableState = state[id];

      const activeCell = tableState.activeCell;
      const selectedRecords = Object.keys(selection);

      if (activeCell.recordID !== null && selectedRecords.length > 1) {
        const activeRecord = activeCell.recordID.toString();
        if (!selectedRecords.includes(activeRecord)) activeCell.recordID = null;
      }
      return {...state, [id]: {...tableState, selection}};
    }

    case TableActionType.SET_ACTIVE_CELL: {
      const { id, cell } = action.payload;
      const tableState = state[id], recordID = cell.recordID;

      if (recordID !== null && !tableState.selection[recordID])
        tableState.selection = {[recordID]: true};
      return {...state, [id]: {...tableState, activeCell: cell}};
    }

    case TableActionType.START_EDITING: {
      const { id, columnID, recordID, isNew } = action.payload;

      const selection: TableSelection = {[recordID]: true};
      const edit: TableEditState = {isNew, modified: isNew};
      const activeCell: TableActiveCell = {columnID, recordID, edited: true};

      return {...state, [id]: {...state[id], selection, activeCell, edit}};
    }

    case TableActionType.END_EDITING: {
      const id = action.payload;
      const tableState = state[id];

      if (tableState.edit.isNew) {
        tableState.selection = {};
        tableState.activeCell.recordID = null;
      }
      const edit = {isNew: false, modified: false};
      const activeCell = {...tableState.activeCell, edited: false};
      return {...state, [id]: {...tableState, edit, activeCell}}
    }

    case TableActionType.RESET: {
      const { id, tableID, channelData } = action.payload;
      const tableState = state[id];
      const total = channelData?.rows.length ?? 0;
      const editable = channelData?.editable ?? tableState.editable;

      if (tableState.total !== total || tableState.activeCell.edited || tableState.edit.isNew) {
        tableState.total = total;
        tableState.selection = {};
        tableState.activeCell = {columnID: null, recordID: null, edited: false};
      }
      if (channelData?.columns) {
        applyColumnTypes(tableState, channelData.columns);
        tableState.recordHandler.setColumns(tableState.columns, channelData.columns);
      }

      const edit = {modified: false, isNew: false};
      return {...state, [id]: {...tableState, tableID, editable, edit}};
    }

    default: return state;
  }
};
