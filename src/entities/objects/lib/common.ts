import { Dispatch } from 'redux';
import { setObjects } from '../store/objects.actions';

import {
  createPlaceModel, createStratumModel,
  createWellModel, createTraceModel,
} from './creators';


/** Преобразует модель трассы в запись канала. */
export function applyModelToRow(channel: Channel, proto: ChannelRow, model: TraceModel) {
  const info = channel.info.columns;
  const cells = proto.Cells;

  cells[info.place.index] = model.place;
  cells[info.name.index] = model.name;
}

/** Проверяет, равны ли узлы трассы. */
export function isNodesEqual(oldNodes: TraceNode[], newNodes: TraceNode[]): boolean {
  if (oldNodes.length !== newNodes.length) return false;
  for (let i = 0; i < oldNodes.length; i++) {
    const oldNode = oldNodes[i], newNode = newNodes[i];
    if (oldNode.id !== newNode.id || oldNode.x !== newNode.x || oldNode.y !== newNode.y) {
      return false;
    }
  }
  return true;
}

/** Преобразует узлы трассы в массив записей канала. */
export function traceToNodeChannelRows(nodeChannel: Channel, model: TraceModel): ChannelRow[] {
  const info = nodeChannel.info.columns;
  const traceID = model.id;

  return model.nodes.map((node, i): ChannelRow => {
    const cells = new Array(nodeChannel.data.columns.length).fill(null);
    cells[info.traceID.index] = traceID;
    cells[info.id.index] = node.id;
    cells[info.x.index] = node.x;
    cells[info.y.index] = node.y;
    cells[info.order.index] = i;
    return {ID: null, Cells: cells};
  });
}

/* --- --- */

/** По данным обновления параметров обновляет активные объекты. */
export function updateObjects(updates: UpdateParamData[], dispatch: Dispatch, state: WState) {
  const { channels, objects } = state;
  let { place, stratum, well, trace } = objects;

  const placeParameterID = place.parameterID;
  const stratumParameterID = stratum.parameterID;
  const wellParameterID = well.parameterID;
  const traceParameterID = trace.parameterID;
  const wellChannel = channels[well.channelName];

  const changeFlags = {place: false, stratum: false, well: false, trace: false};
  for (const { id, value } of updates) {
    if (id === placeParameterID) {
      place.model = value ? createPlaceModel(value) : null;
      changeFlags.place = true;
    }
    else if (id === stratumParameterID) {
      stratum.model = value ? createStratumModel(value) : null;
    }
    else if (id === wellParameterID) {
      well.model = value ? createWellModel(value) : null;
      changeFlags.well = true;
    }
    else if (id === traceParameterID) {
      const nodeChannel = channels[trace.nodeChannelName];
      const model = value ? createTraceModel(value, nodeChannel, wellChannel) : null;
      trace = {...trace, model, oldModel: null, editing: false, creating: false};
      changeFlags.trace = true;
    }
  }

  if (changeFlags.place || changeFlags.stratum || changeFlags.well || changeFlags.trace) {
    const newObjects: ObjectsState = {place, stratum, well, trace};
    if (changeFlags.place) newObjects.place = {...place};
    if (changeFlags.stratum) newObjects.stratum = {...stratum};
    if (changeFlags.well) newObjects.well = {...well};
    dispatch(setObjects(newObjects));
  }
}
