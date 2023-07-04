import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { reloadChannel, updateTables } from '../../channels';
import { channelsAPI } from '../../channels/lib/channels.api';
import { applyModelToRow, traceToNodeChannelRows } from '../lib/common';
import { setCurrentTrace } from './objects.actions';
import { updateParamDeep } from '../../parameters';
import { tableRowToString } from '../../parameters/lib/table-row';


/** Создание новой трассы. */
export function createTrace(model: TraceModel): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const { channelName, parameterID } = state.objects.trace;

    const traceChannel = state.channels[channelName];
    const resNewRow = await channelsAPI.getNewRow(traceChannel.tableID);
    if (resNewRow.ok === false) return;

    const newRow = resNewRow.data; // id новой трассы берётся из newRow
    model.id = newRow.Cells[traceChannel.info.columns.id.index];
    applyModelToRow(traceChannel, newRow, model);

    await channelsAPI.insertRows(traceChannel.tableID, [newRow]).then();
    await reloadChannel(traceChannel.name)(dispatch, getState);

    const rowString = tableRowToString(traceChannel, newRow);
    await updateParamDeep(state.root.id, parameterID, rowString)(dispatch, getState);
    dispatch(setCurrentTrace(model, true, true));
  };
}

/** Сохранение изменений трассы. */
export function saveTrace(saveNodes?: boolean): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const { model, channelName, parameterID } = state.objects.trace;
    const traceChannel = state.channels[channelName];

    const idIndex = traceChannel.info.columns.id.index;
    const index = traceChannel.data.rows.findIndex(row => row.Cells[idIndex] === model.id);
    const row = traceChannel.data.rows[index];
    applyModelToRow(traceChannel, row, model);

    await channelsAPI.updateRows(traceChannel.tableID, [index], [row]);
    await reloadChannel(traceChannel.name)(dispatch, getState);
    if (saveNodes) await saveTraceNodes()(dispatch, getState);

    const rowString = tableRowToString(traceChannel, row);
    await updateParamDeep(state.root.id, parameterID, rowString)(dispatch, getState);
    dispatch(setCurrentTrace(undefined, false, false));
  };
}

/** Сохранение изменений узлов трассы. */
export function saveTraceNodes(): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const traceState = state.objects.trace;

    const nodeChannel = state.channels[traceState.nodeChannelName];
    const tableID = nodeChannel.tableID;
    if (!tableID) return;

    const nodeRows = traceToNodeChannelRows(nodeChannel, traceState.model);
    await channelsAPI.removeRows(tableID, 'all');
    await channelsAPI.insertRows(tableID, nodeRows).then();
    await reloadChannel(nodeChannel.name)(dispatch, getState);
  };
}

/** Удаление трассы. */
export function deleteTrace(): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const traceState = state.objects.trace;
    const traceChannel = state.channels[traceState.channelName];

    const traceTableID = traceChannel.tableID;
    const nodesTableID = state.channels[traceState.nodeChannelName].tableID;

    const rowIndex = traceChannel.data.rows.findIndex(row => row.Cells[0] === traceState.model.id);
    if (rowIndex === -1) return;

    await Promise.all([
      channelsAPI.removeRows(traceTableID, [rowIndex]).then(),
      channelsAPI.removeRows(nodesTableID, 'all').then(),
    ]);

    await updateTables([traceTableID, nodesTableID])(dispatch, getState);
    await updateParamDeep(state.root.id, traceState.parameterID, null)(dispatch, getState);
    dispatch(setCurrentTrace(undefined, false, false));
  };
}

// /** Функция с dispatch выполняющая проверку результата выполнения запроса. */
// function checkResultForErrors(res, dispatch): boolean {
//   let wrongResult: boolean, error: string;
//
//   if (res.ok === false) {
//     dispatch(setWindowWarning(res.data));
//   } else {
//     wrongResult = res.data.WrongResult;
//     error = res.data.Error;
//   }
//
//   if (wrongResult && error) {
//     dispatch(setWindowWarning(error));
//     dispatch(closeWindowNotification());
//   }
//   return res.ok;
// }
