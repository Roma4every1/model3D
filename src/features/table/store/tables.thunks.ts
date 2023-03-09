import { Dispatch } from 'redux';
import { StateGetter, Thunk } from 'shared/lib';
import { SaveTableMetadata, SetRecords } from '../lib/types';
import { t } from 'shared/locales';
import { updateTables } from 'entities/channels';
import { createRecord } from '../lib/records';
import { startTableEditing } from './tables.actions';
import { reloadChannel } from 'entities/channels';
import { setWindowWarning, showNotice } from 'entities/windows';
import { setWindowNotification, closeWindowNotification } from 'entities/windows';
import { channelsAPI } from 'entities/channels/lib/channels.api';


/** Перезагрузка данных канала таблицы. */
export const reloadTable = (id: FormID): Thunk => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const channelName = state.tables[id]?.channelName;
    if (!channelName) return;

    await reloadChannel(channelName)(dispatch, () => state);
    showNotice(dispatch, t('table.reload.end-ok'));
  };
};

/** Сохранение состояния строк таблицы в базу данных. */
export const saveTableRecord = ({type, formID, row}: SaveTableMetadata): Thunk => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    dispatch(setWindowNotification(t('table.save.start')));
    const state = getState();
    const tableID = state.tables[formID].tableID;
    let res: Res<Report>, wrongResult: boolean, error: string;

    if (type === 'insert') {
      res = await channelsAPI.insertRows(tableID, [row]);
    } else {
      res = await channelsAPI.updateRows(tableID, [row.ID], [row]);
    }

    if (res.ok === false) {
      dispatch(setWindowWarning(res.data));
      dispatch(closeWindowNotification());
    } else {
      wrongResult = res.data.WrongResult;
      error = res.data.Error;
    }

    if (wrongResult && error) {
      dispatch(setWindowWarning(error));
      dispatch(closeWindowNotification());
    }

    const tables = [tableID];
    if (res.ok) tables.push(...res.data.ModifiedTables?.ModifiedTables);

    await updateTables(tables)(dispatch, () => state);
    showNotice(dispatch, t('table.save.' + (!res.ok || wrongResult ? 'end-error' : 'end-ok')));
  };
};

/** Удаление строк таблицы. */
export const deleteTableRecords = (formID: FormID, ids: number[] | 'all'): Thunk<boolean> => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    if (Array.isArray(ids) && ids.length === 0) return;

    const state = getState();
    const tableState = state.tables[formID];
    const res = await channelsAPI.removeRows(tableState.tableID, ids);

    if (res.ok === false) { dispatch(setWindowWarning(res.data)); return false; }
    const ok = !res.data.WrongResult;
    if (!ok && res.data.Error) { dispatch(setWindowWarning(res.data.Error)); return false; }

    const activeCell = tableState.activeCell;
    if (activeCell.recordID && (ids === 'all' || ids.includes(activeCell.recordID))) {
      if (activeCell.edited) tableState.edit = {isNew: false, modified: false};
      tableState.activeCell = {columnID: null, recordID: null, edited: false};
    }
    tableState.selection = {};

    const tables = [tableState.tableID, ...res.data.ModifiedTables?.ModifiedTables];
    await updateTables(tables)(dispatch, () => state);
    return ok;
  };
};

export const getNewRow = (
  id: FormID, state: TableState, setRecords: SetRecords,
  copy: boolean, index?: number
): Thunk => {
  return async (dispatch: Dispatch) => {
    const res = !copy && await channelsAPI.getNewRow(state.tableID);
    if (!copy && res.ok === false) { dispatch(setWindowWarning(res.data)); return; }

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
};
