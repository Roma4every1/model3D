/** Преобразует модель трассы в запись канала. */
export function applyModelToRow(channel: Channel, proto: ChannelRow, model: TraceModel) {
  const info = channel.info.columns;
  const cells = proto.Cells;

  cells[info.place.index] = model.place;
  cells[info.name.index] = model.name;
  cells[info.nodes.index] = model.nodes.length ? model.nodes.map(node => node.id).join(',') : null;
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
