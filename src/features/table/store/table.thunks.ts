import { Dispatch } from 'redux';
import { StateGetter, Thunk } from 'shared/lib';
import { SaveTableMetadata, SetRecords } from '../lib/types';
import { t } from 'shared/locales';
import { createElement } from 'react';
import { watchReport } from 'entities/reports';
import { fillParamValues, updateParamDeep } from 'entities/parameters';
import { tableRowToString } from 'entities/parameters/lib/table-row';
import { updateTables, reloadChannel, setChannelActiveRow } from 'entities/channels';
import { showWarningMessage, showWindow, closeWindow } from 'entities/window';
import { showNotification } from 'entities/notifications';
import { channelsAPI } from 'entities/channels/lib/channels.api';
import { reportsAPI } from 'entities/reports/lib/reports.api';
import { createRecord } from '../lib/records';
import { createTableState, startTableEditing } from './table.actions';
import { tableStateToSettings } from '../lib/table-settings';
import { LinkedTable } from '../components/table/linked-table';


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
    let res: Res<ReportStatus>, wrongResult: boolean, error: string;

    if (type === 'insert') {
      res = await channelsAPI.insertRows(tableID, [row]);
    } else {
      res = await channelsAPI.updateRows(tableID, [row.ID], [row]);
    }

    if (res.ok === false) {
      dispatch(showWarningMessage(res.data));
    } else {
      wrongResult = res.data.WrongResult;
      error = res.data.Error;
    }

    if (wrongResult && error) {
      dispatch(showWarningMessage(error));
    }

    const tables = [tableID];
    if (res.ok) tables.push(...res.data.ModifiedTables?.ModifiedTables);

    await updateTables(tables)(dispatch, getState);
    const text = t('table.save.' + (!res.ok || wrongResult ? 'end-error' : 'end-ok'));
    await showNotification(text)(dispatch);
  };
}

/** Удаление строк таблицы. */
export function deleteTableRecords(formID: FormID, indexes: number[] | 'all'): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    if (Array.isArray(indexes) && indexes.length === 0) return;
    const tableState = getState().tables[formID];
    const res = await channelsAPI.removeRows(tableState.tableID, indexes);

    if (res.ok === false) { dispatch(showWarningMessage(res.data)); return; }
    const ok = !res.data.WrongResult;
    if (!ok && res.data.Error) { dispatch(showWarningMessage(res.data.Error)); return; }

    const activeCell = tableState.activeCell;
    if (activeCell.recordID && (indexes === 'all' || indexes.includes(activeCell.recordID))) {
      if (activeCell.edited) tableState.edit = {isNew: false, modified: false};
      tableState.activeCell = {columnID: null, recordID: null, edited: false};
    }
    tableState.selection = {};

    const tables = [tableState.tableID, ...res.data.ModifiedTables?.ModifiedTables];
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
    const res = !copy && await channelsAPI.getNewRow(state.tableID);
    if (!copy && res.ok === false) { dispatch(showWarningMessage(res.data)); return; }

    const newID = state.total;
    const activeRecordID = state.activeCell.recordID;

    setRecords((records) => {
      if (index === undefined) {
        index = activeRecordID ? records.findIndex(rec => rec.id === activeRecordID) : 0;
      }
      const cells = copy ? records[index].cells : res.data['Cells'];
      const record = createRecord(newID, cells, Object.values(state.columns));
      records.splice(index, 0, record);
      return records;
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
    if (res.ok && res.data.OperationId) watchReport(null, res.data.OperationId, dispatch);
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

    const presentation = state.presentations[state.root.activeChildID];
    const hasFormData = presentation.children.some(c => c.id === linkedTableID);

    if (!hasFormData) {
      const formData: FormDataWM = {
        id: linkedTableID, type: 'dataSet',
        displayName: channel.info.displayName,
        displayNameString: null, displayNamePattern: null,
      };
      const formState: FormState = {
        id: linkedTableID, parent: formID,
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

    const onClose = () => dispatch(closeWindow(linkedTableID));
    const windowProps = {
      className: 'linked-table-window', style: {zIndex: 99}, width: 400, height: 300,
      resizable: false, title: channel.info.displayName, onClose,
    };
    const content = createElement(LinkedTable, {id: linkedTableID, onClose});
    dispatch(showWindow(linkedTableID, windowProps, content));
  };
}
