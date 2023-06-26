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
    const res = await channelsAPI.insertRows(tableID, [row]);
    checkResultForErrors(res, dispatch);
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

    const res = await channelsAPI.updateRows(tableID, [id], [traceModelToChannelRow(traceData)]);
    checkResultForErrors(res, dispatch);
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
    checkResultForErrors(traceRes, dispatch);

    if (!isTraceCreating) {
      const itemsRes = await channelsAPI.removeRows(itemsTableID, 'all');
      checkResultForErrors(itemsRes, dispatch);
    }


    await updateTables([tableID, itemsTableID])(dispatch, () => state);
    return traceRes.ok;
  };
};

/** Сохранение изменений в таблице с узлами трассы. */
export const updateTraceItems = (itemsTableID: TableID, traceID: number, items, isTraceCreating): Thunk<boolean> => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();

    if (!isTraceCreating) {
      const removeOldItemsRes = await channelsAPI.removeRows(itemsTableID, 'all');
      checkResultForErrors(removeOldItemsRes, dispatch);
    }

    const itemsRows : ChannelRow[] = items.map( (item, index) => ({
      ID: null,
      Cells: [traceID, item, (10+index)*1000, null, null]
    }));
    const itemsRes = await channelsAPI.insertRows(itemsTableID, itemsRows);
    checkResultForErrors(itemsRes, dispatch);

    await updateTables([itemsTableID])(dispatch, () => state);
    return itemsRes.ok;
  };
};

/** Функция с dispatch выполняющая проверку результата выполнения запроса. */
const checkResultForErrors = (res, dispatch): boolean => {
  let wrongResult: boolean, error: string;

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

  return res.ok
}
