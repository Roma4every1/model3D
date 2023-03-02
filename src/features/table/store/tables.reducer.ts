import { TableInit } from '../lib/types';
import { getFlatten } from '../lib/column-tree';
import { settingsToState, applyColumnTypes } from '../lib/initialization';

/* --- Action Types --- */

export enum TableActions {
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
  type: TableActions.CREATE,
  payload: {id: FormID, init: TableInit},
}
interface ActionSetColumns {
  type: TableActions.SET_COLUMNS,
  payload: {id: FormID, columns: TableColumnsState},
}
interface ActionSetColumnTree {
  type: TableActions.SET_COLUMN_TREE,
  payload: {id: FormID, tree: ColumnTree},
}
interface ActionSetColumnSettings {
  type: TableActions.SET_COLUMNS_SETTINGS,
  payload: {id: FormID, settings: TableColumnsSettings},
}
interface ActionSetSelection {
  type: TableActions.SET_SELECTION,
  payload: {id: FormID, selection: TableSelection},
}
interface ActionSetActiveCell {
  type: TableActions.SET_ACTIVE_CELL,
  payload: {id: FormID, cell: TableActiveCell},
}
interface ActionStartEditing {
  type: TableActions.START_EDITING,
  payload: {id: FormID, columnID: TableColumnID, recordID: TableRecordID, isNew: boolean},
}
interface ActionEndEditing {
  type: TableActions.END_EDITING,
  payload: FormID,
}
interface ActionReset {
  type: TableActions.RESET,
  payload: {id: FormID, tableID: TableID, channelData: ChannelData},
}

export type TablesAction = ActionCreate | ActionSetColumns | ActionSetColumnTree |
  ActionSetColumnSettings | ActionSetSelection | ActionSetActiveCell |
  ActionStartEditing | ActionEndEditing | ActionReset;

/* --- Init State & Reducer --- */

const init: TablesState = {};

export const tablesReducer = (state: TablesState = init, action: TablesAction): TablesState => {
  switch (action.type) {

    case TableActions.CREATE: {
      const { id, init } = action.payload;
      return {...state, [id]: settingsToState(init)};
    }

    case TableActions.SET_COLUMNS: {
      const { id, columns } = action.payload;
      return {...state, [id]: {...state[id], columns}};
    }

    case TableActions.SET_COLUMN_TREE: {
      const { id, tree } = action.payload;
      const columnTreeFlatten = getFlatten(tree);
      return {...state, [id]: {...state[id], columnTree: tree, columnTreeFlatten}};
    }

    case TableActions.SET_COLUMNS_SETTINGS: {
      const { id, settings } = action.payload;
      return {...state, [id]: {...state[id], columnsSettings: settings}};
    }

    case TableActions.SET_SELECTION: {
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

    case TableActions.SET_ACTIVE_CELL: {
      const { id, cell } = action.payload;
      const tableState = state[id], recordID = cell.recordID;

      if (recordID !== null && !tableState.selection[recordID])
        tableState.selection = {[recordID]: true};
      return {...state, [id]: {...tableState, activeCell: cell}};
    }

    case TableActions.START_EDITING: {
      const { id, columnID, recordID, isNew } = action.payload;

      const selection: TableSelection = {[recordID]: true};
      const edit: TableEditState = {isNew, modified: isNew};
      const activeCell: TableActiveCell = {columnID, recordID, edited: true};

      return {...state, [id]: {...state[id], selection, activeCell, edit}};
    }

    case TableActions.END_EDITING: {
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

    case TableActions.RESET: {
      const { id, tableID, channelData } = action.payload;
      const { columns, editable } = channelData;
      const total = channelData.rows.length;
      const tableState = state[id];

      if (tableState.total !== total) {
        tableState.total = total;
        tableState.selection = {};
        tableState.activeCell = {...tableState.activeCell, recordID: null, edited: false};
      }
      if (!tableState.properties.typesApplied) {
        applyColumnTypes(tableState, columns);
        tableState.properties.typesApplied = true;
      }

      const edit = {modified: false, isNew: false};
      return {...state, [id]: {...tableState, tableID, editable, edit}};
    }

    default: return state;
  }
};
