import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { updateTables } from 'entities/channels';
import { channelsAPI } from 'entities/channels/lib/channels.api';
import { closeWindowNotification, setWindowWarning } from 'entities/windows';


/** Сохренение изменений в строке с трассой или создание новой строки с трассой. */
export const saveTraceThunk = (
  formID: FormID, tableID: TableID,
  method: 'create' | 'update', row: ChannelRow
) => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();

    let res: Res<ReportStatus>, wrongResult: boolean, error: string;

    if (method==='create') {
      res = await channelsAPI.insertRows(tableID, [row]);
    }
    if (method==='update') {
      res = await channelsAPI.updateRows(tableID, [row.ID], [row]);
    }

    if (res.ok === false) {
      dispatch(setWindowWarning(res.data));
    } else {
      wrongResult = res.data.WrongResult;
      error = res.data.Error;
    }

    if (wrongResult && error) {
      dispatch(setWindowWarning(error));
      dispatch(closeWindowNotification());
    }

    await updateTables([tableID])(dispatch, () => state);
  }
}

/** Удаление строк трассы по id. */
export const deleteTraceThunk = (formID: FormID, tableID: TableID, id: number): Thunk<boolean> => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const res = await channelsAPI.removeRows(tableID, [id]);

    if (res.ok === false) { dispatch(setWindowWarning(res.data)); return false; }
    const ok = !res.data.WrongResult;
    if (!ok && res.data.Error) { dispatch(setWindowWarning(res.data.Error)); return false; }

    await updateTables([tableID])(dispatch, () => state);
    return ok;
  };
};
