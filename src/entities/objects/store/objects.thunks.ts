import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { reloadChannel, updateTables, channelAPI } from 'entities/channels';
import { applyModelToRow, isNodesEqual, traceToNodeChannelRows } from '../lib/common';
import { setCurrentTrace } from './objects.actions';
import { updateParamDeep } from '../../parameters';
import { tableRowToString } from '../../parameters/lib/table-row';


/** Обновление параметры скважины. */
export function setCurrentWell(id: WellID): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const { channelName, parameterID, model } = state.objects.well;
    if (model && model.id === id) return;
    const wellChannel = state.channels[channelName];

    const idIndex = wellChannel.info.lookupColumns.id.index;
    const row = wellChannel.data?.rows.find(r => r[idIndex] === id);
    if (!row) return;

    const rowString = tableRowToString(wellChannel, row);
    await updateParamDeep(state.root.id, parameterID, rowString)(dispatch, getState);
  };
}

/** Создание новой трассы. */
export function createTrace(model: TraceModel): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const { channelName, parameterID } = state.objects.trace;

    const traceChannel = state.channels[channelName];
    const resNewRow = await channelAPI.getNewRow(traceChannel.queryID);
    if (resNewRow.ok === false) return;

    const newRow = resNewRow.data; // id новой трассы берётся из newRow
    model.id = newRow[traceChannel.info.columns.id.index];
    applyModelToRow(traceChannel, newRow, model);

    await channelAPI.insertRows(traceChannel.queryID, [newRow]).then();
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
    const index = traceChannel.data.rows.findIndex(row => row[idIndex] === model.id);
    const row = traceChannel.data.rows[index];
    applyModelToRow(traceChannel, row, model);

    await channelAPI.updateRows(traceChannel.queryID, [index], [row]);
    await reloadChannel(traceChannel.name)(dispatch, getState);

    if (!isNodesEqual(oldModel?.nodes ?? [], model.nodes)) {
      const { objects, channels } = getState();
      const nodeChannel = channels[objects.trace.nodeChannelName];
      const queryID = nodeChannel.queryID;

      const nodeRows = traceToNodeChannelRows(nodeChannel, objects.trace.model);
      await channelAPI.removeRows(queryID, 'all');
      await channelAPI.insertRows(queryID, nodeRows).then();
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

    const traceQueryID = traceChannel.queryID;
    const nodesQueryID = state.channels[traceState.nodeChannelName].queryID;

    const rowIndex = traceChannel.data.rows.findIndex(row => row[0] === traceState.model.id);
    if (rowIndex === -1) return;

    await Promise.all([
      channelAPI.removeRows(traceQueryID, [rowIndex]).then(),
      channelAPI.removeRows(nodesQueryID, 'all').then(),
    ]);

    await updateTables([traceQueryID, nodesQueryID])(dispatch, getState);
    await updateParamDeep(state.root.id, traceState.parameterID, null)(dispatch, getState);
    dispatch(setCurrentTrace(undefined, false, false));
  };
}
