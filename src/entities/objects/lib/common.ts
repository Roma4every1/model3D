import { Dispatch } from 'redux';
import { createPlaceModel, createWellModel, createTraceModel } from './creators';
import { setObjects } from '../store/objects.actions';


/** Преобразует модель трассы в запись канала. */
export function applyModelToRow(channel: Channel, proto: ChannelRow, model: TraceModel) {
  const info = channel.info.columns;
  const cells = proto.Cells;

  cells[info.place.index] = model.place;
  cells[info.name.index] = model.name;
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
  const { place, well, trace } = objects;

  const placeParameterID = place.parameterID;
  const wellParameterID = well.parameterID;
  const traceParameterID = trace.parameterID;

  const placeChannel = channels[place.channelName];
  const wellChannel = channels[well.channelName];
  const traceChannel = channels[trace.channelName];
  const nodeChannel = channels[trace.nodeChannelName];

  const changeFlags = {place: false, well: false, trace: false};
  for (const { id, value } of updates) {
    if (id === placeParameterID) {
      place.model = value ? createPlaceModel(value, placeChannel.info.columns) : null;
      changeFlags.place = true;
    } else if (id === wellParameterID) {
      well.model = value ? createWellModel(value, wellChannel.info.columns) : null;
      changeFlags.well = true;
    } else if (id === traceParameterID) {
      trace.model = value ? createTraceModel(value, traceChannel, nodeChannel, wellChannel) : null;
      changeFlags.trace = true;
    }
  }

  if (changeFlags.place || changeFlags.well || changeFlags.trace) {
    const newObjects: ObjectsState = {place, well, trace};
    if (changeFlags.place) newObjects.place = {...place};
    if (changeFlags.well) newObjects.well = {...well};
    if (changeFlags.trace) newObjects.trace = {...trace};
    dispatch(setObjects(newObjects));
  }
}
