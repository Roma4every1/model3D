import {Dispatch} from "redux";
import {StateGetter, Thunk} from "../../../shared/lib";
import {channelsAPI} from "../../channels/lib/channels.api";
import {closeWindowNotification, setWindowWarning} from "../../windows";
import {updateTables} from "../../channels";
import {traceModelToChannelRow} from "../lib/traces-utils";


/** Создание новой строки с трассой. */
export const createTraceRow = (
  tableID: TableID,
  currentStratumID
) => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const row = {ID: null, Cells: [null, "Без имени", currentStratumID, null]};

    let res: Res<ReportStatus>, wrongResult: boolean, error: string;

    res = await channelsAPI.insertRows(tableID, [row]);

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


/** Сохренение изменений в строке с трассой. */
export const updateTraceData = (
  tableID: TableID,
  traceData,
  id: number | null
) => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();

    let res: Res<ReportStatus>, wrongResult: boolean, error: string;

    res = await channelsAPI.updateRows(tableID, [id], [traceModelToChannelRow(traceData)]);

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
export const removeTraceRow = (tableID: TableID,
                               id: number,
                               itemsTableID: TableID,
                               isTraceCreating?: boolean
): Thunk<boolean> => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();

    const traceRes = await channelsAPI.removeRows(tableID, [id]);
    if (traceRes.ok === false) { dispatch(setWindowWarning(traceRes.data)); return false; }
    const traceOk = !traceRes.data.WrongResult;
    if (!traceOk && traceRes.data.Error) { dispatch(setWindowWarning(traceRes.data.Error)); return false; }

    if (!isTraceCreating) {
      const itemsRes = await channelsAPI.removeRows(itemsTableID, 'all');
      if (itemsRes.ok === false) { dispatch(setWindowWarning(itemsRes.data)); return false; }
      const itemsOk = !itemsRes.data.WrongResult;
      if (!itemsOk && itemsRes.data.Error) { dispatch(setWindowWarning(itemsRes.data.Error)); return false; }
    }


    await updateTables([tableID, itemsTableID])(dispatch, () => state);
    return traceOk;
  };
};


export const updateTraceItems = (itemsTableID: TableID, traceID: number, items, isTraceCreating): Thunk<boolean> => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();

    let itemsRes, removeOldItemsRes: Res<ReportStatus>, wrongResult: boolean, error: string;

    if (!isTraceCreating) {
      removeOldItemsRes = await channelsAPI.removeRows(itemsTableID, 'all');

      if (removeOldItemsRes.ok === false) {
        dispatch(setWindowWarning(removeOldItemsRes.data));
      } else {
        wrongResult = removeOldItemsRes.data.WrongResult;
        error = removeOldItemsRes.data.Error;
      }
    }

    const itemsRows : ChannelRow[] = items.map( (item, index) => ({
      ID: null,
      Cells: [traceID, item, (10+index)*1000, null, null]
    }));
    itemsRes = await channelsAPI.insertRows(itemsTableID, itemsRows);

    if (itemsRes.ok === false) {
      dispatch(setWindowWarning(itemsRes.data));
    } else {
      wrongResult = itemsRes.data.WrongResult;
      error = itemsRes.data.Error;
    }

    if (wrongResult && error) {
      dispatch(setWindowWarning(error));
      dispatch(closeWindowNotification());
    }

    await updateTables([itemsTableID])(dispatch, () => state);
    return itemsRes.ok;
  };
};
