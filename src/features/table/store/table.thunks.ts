import { Dispatch } from 'redux';
import { StateGetter, Thunk, Res } from 'shared/lib';
import { SaveTableMetadata, SetRecords } from '../lib/types';
import { t } from 'shared/locales';
import { createElement } from 'react';
import { watchOperation } from 'entities/reports';
import { fillParamValues, updateParamDeep } from 'entities/parameters';
import { tableRowToString } from 'entities/parameters/lib/table-row';
import { updateTables, reloadChannel, setChannelActiveRow, channelAPI } from 'entities/channels';
import { showWarningMessage, showWindow, closeWindow } from 'entities/window';
import { showNotification } from 'entities/notifications';
import { reportsAPI } from 'entities/reports/lib/report.api.ts';
import { createTableState, startTableEditing } from './table.actions';
import { tableStateToSettings } from '../lib/table-settings';
import { LinkedTable } from '../components/table/linked-table';
import { setActiveForm } from '../../../widgets/presentation';


/** Перезагрузка данных канала таблицы. */
export function reloadTable(id: FormID): Thunk {
  return async (dispatch: Dispatch<any>, getState: StateGetter) => {
    const channelName = getState().tables[id]?.channelName;
    if (!channelName) return;
    await reloadChannel(channelName)(dispatch, getState);
    await showNotification(t('table.reload.end-ok'))(dispatch);
  };
}

/** Обновляет параметр активной строки. */
export function updateActiveRecord(id: FormID, recordID: TableRecordID): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const tableState = state.tables[id];

    const channel = state.channels[tableState.channelName];
    const row = channel.data.rows[recordID];
    dispatch(setChannelActiveRow(channel.name, row));

    if (tableState.activeRecordParameter) {
      const { id: parameterID, clientID } = tableState.activeRecordParameter;
      const newValue = tableRowToString(channel, row);
      await updateParamDeep(clientID, parameterID, newValue)(dispatch, getState);
    }
  };
}

/** Сохранение состояния строк таблицы в базу данных. */
export function saveTableRecord({type, formID, row}: SaveTableMetadata): Thunk {
  return async (dispatch: Dispatch<any>, getState: StateGetter) => {
    showNotification(t('table.save.start'))(dispatch).then();
    const tableID = getState().tables[formID].tableID;
    let res: Res<OperationData>;

    if (type === 'insert') {
      res = await channelAPI.insertRows(tableID, [row]);
    } else {
      res = await channelAPI.updateRows(tableID, [row.ID], [row]);
    }

    let error: string;
    const tables: TableID[] = [tableID];

    if (res.ok === false) {
      error = res.message;
    } else if (res.data.error) {
      error = res.data.error;
    } else {
      tables.push(...res.data.modifiedTables);
    }
    if (error) dispatch(showWarningMessage(error));

    await updateTables(tables)(dispatch, getState);
    const text = t('table.save.' + (error ? 'end-error' : 'end-ok'));
    await showNotification(text)(dispatch);
  };
}

/** Удаление строк таблицы. */
export function deleteTableRecords(formID: FormID, indexes: number[] | 'all'): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    if (Array.isArray(indexes) && indexes.length === 0) return;
    const tableState = getState().tables[formID];
    const res = await channelAPI.removeRows(tableState.tableID, indexes);

    if (res.ok === false) { dispatch(showWarningMessage(res.message)); return; }
    if (res.data.error) { dispatch(showWarningMessage(res.data.error)); return; }

    const activeCell = tableState.activeCell;
    if (activeCell.recordID && (indexes === 'all' || indexes.includes(activeCell.recordID))) {
      if (activeCell.edited) tableState.edit = {isNew: false, modified: false};
      tableState.activeCell = {columnID: null, recordID: null, edited: false};
    }
    tableState.selection = {};

    const tables = [tableState.tableID, ...res.data.modifiedTables];
    await updateTables(tables)(dispatch, getState);
    const text = t('table.delete-dialog.delete-ok', {n: indexes.length});
    await showNotification(text)(dispatch);
  };
}

export function getNewRow (
  id: FormID, state: TableState, setRecords: SetRecords,
  copy: boolean, index?: number,
): Thunk {
  return async (dispatch: Dispatch) => {
    const res = !copy && await channelAPI.getNewRow(state.tableID);
    if (!copy && res.ok === false) { dispatch(showWarningMessage(res.message)); return; }

    const newID = state.total;
    const activeRecordID = state.activeCell.recordID;

    setRecords((records) => {
      if (index === undefined) {
        index = activeRecordID ? records.findIndex(rec => rec.id === activeRecordID) : 0;
      }
      const cells = copy ? records[index].cells : res.data['Cells'];
      const record = state.recordHandler.createRecord(newID, cells);
      records.splice(index, 0, record);
      return [...records];
    });

    const editColumnID = state.activeCell.columnID ?? state.columnTreeFlatten[0];
    dispatch(startTableEditing(id, editColumnID, newID, true));
  };
}

export function exportTableToExcel(id: FormID): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const tableState = state.tables[id];
    const info = state.channels[tableState.channelName].info;

    const parentID = state.forms[id].parent;
    const parentState = state.presentations[parentID];

    const exportData = {
      channelName: tableState.channelName,
      paramName: parentState.children.find(child => child.id === id)?.displayName ?? 'Таблица',
      presentationId: parentID,
      paramValues: fillParamValues(info.parameters, state.parameters, info.clients),
      settings: tableStateToSettings(id, tableState).columns,
    };

    const res = await reportsAPI.exportToExcel(exportData);
    if (res.ok === false) { dispatch(showWarningMessage(res.message)); return; }

    const { operationID, error } = res.data;
    if (error) { dispatch(showWarningMessage(error)); return; }
    if (operationID) await watchOperation(null, operationID, dispatch, getState).then();
  };
}

export function showLinkedTable(formID: FormID, columnID: TableColumnID): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const linkedTableID = formID + columnID;
    const rootTableState = state.tables[formID];
    const linkedTableState = state.tables[linkedTableID];

    const property = rootTableState?.properties.list.find(p => p.name === columnID);
    if (!property || !property.secondLevelChannelName) return;
    const channel = state.channels[property.secondLevelChannelName];

    const presentationID = state.root.activeChildID;
    const presentation = state.presentations[presentationID];
    const hasFormData = presentation.children.some(c => c.id === linkedTableID);

    if (!hasFormData) {
      const formData: FormDataWM = {
        id: linkedTableID, type: 'dataSet',
        displayName: channel.info.displayName,
        displayNameString: null, displayNamePattern: null,
      };
      const formState: FormState = {
        id: linkedTableID, parent: presentationID,
        type: 'dataSet', settings: null,
        channels: [{name: channel.name, attachOption: 'AttachAll', exclude: []}],
      };
      presentation.children.push(formData);
      state.forms[linkedTableID] = formState;
    }
    if (!linkedTableState) {
      const payload: FormStatePayload = {
        state: state.forms[linkedTableID],
        settings: {
          id: linkedTableID, columns: null,
          attachedProperties: {attachOption: 'AttachAll', exclude: []},
          headerSetterRules: [],
        },
        objects: state.objects,
        parameters: state.parameters,
        channels: state.channels,
      };
      dispatch(createTableState(payload));
    }

    const onFocus = () => {
      dispatch(setActiveForm(presentationID, linkedTableID));
    };
    const onClose = () => {
      dispatch(setActiveForm(presentationID, formID));
      dispatch(closeWindow(linkedTableID));
    };
    const windowProps = {
      className: 'linked-table-window', style: {zIndex: 99}, width: 400, height: 300,
      resizable: false, title: channel.info.displayName, onFocus, onClose,
    };

    const content = createElement(LinkedTable, {id: linkedTableID, onClose});
    dispatch(showWindow(linkedTableID, windowProps, content));
    dispatch(setActiveForm(presentationID, linkedTableID));
  };
}
