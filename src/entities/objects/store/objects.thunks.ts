import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { reloadChannel, updateTables, channelAPI } from 'entities/channels';
import { applyModelToRow, isNodesEqual, traceToNodeChannelRows } from '../lib/common';
import { setCurrentTrace } from './objects.actions';
import { updateParamDeep } from '../../parameters';
import { tableRowToString } from '../../parameters/lib/table-row';


/** Создание новой трассы. */
export function createTrace(model: TraceModel): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const { channelName, parameterID } = state.objects.trace;

    const traceChannel = state.channels[channelName];
    const resNewRow = await channelAPI.getNewRow(traceChannel.tableID);
    if (resNewRow.ok === false) return;

    const newRow = resNewRow.data; // id новой трассы берётся из newRow
    model.id = newRow.Cells[traceChannel.info.columns.id.index];
    applyModelToRow(traceChannel, newRow, model);

    await channelAPI.insertRows(traceChannel.tableID, [newRow]).then();
    await reloadChannel(traceChannel.name)(dispatch, getState);

    const rowString = tableRowToString(traceChannel, newRow);
    await updateParamDeep(state.root.id, parameterID, rowString)(dispatch, getState);
    dispatch(setCurrentTrace(model, true, true));
  };
}

/** Сохранение изменений трассы. */
export function saveTrace(): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const { model, oldModel, channelName, parameterID } = state.objects.trace;
    const traceChannel = state.channels[channelName];

    const idIndex = traceChannel.info.columns.id.index;
    const index = traceChannel.data.rows.findIndex(row => row.Cells[idIndex] === model.id);
    const row = traceChannel.data.rows[index];
    applyModelToRow(traceChannel, row, model);

    await channelAPI.updateRows(traceChannel.tableID, [index], [row]);
    await reloadChannel(traceChannel.name)(dispatch, getState);

    if (!isNodesEqual(oldModel?.nodes ?? [], model.nodes)) {
      const { objects, channels } = getState();
      const nodeChannel = channels[objects.trace.nodeChannelName];
      const tableID = nodeChannel.tableID;

      const nodeRows = traceToNodeChannelRows(nodeChannel, objects.trace.model);
      await channelAPI.removeRows(tableID, 'all');
      await channelAPI.insertRows(tableID, nodeRows).then();
      await reloadChannel(nodeChannel.name)(dispatch, getState);
    }

    const rowString = tableRowToString(traceChannel, row);
    await updateParamDeep(state.root.id, parameterID, rowString)(dispatch, getState);
    dispatch(setCurrentTrace(undefined, false, false));
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
      channelAPI.removeRows(traceTableID, [rowIndex]).then(),
      channelAPI.removeRows(nodesTableID, 'all').then(),
    ]);

    await updateTables([traceTableID, nodesTableID])(dispatch, getState);
    await updateParamDeep(state.root.id, traceState.parameterID, null)(dispatch, getState);
    dispatch(setCurrentTrace(undefined, false, false));
  };
}
