import { stringToTableCell } from '../../parameters/lib/table-row';


/** По значение `TableRow` параметра создаёт модель месторождения. */
export function createPlaceModel(value: ParamValueTableRow, info: ChannelColumnInfo): PlaceModel {
  const id = parseInt(stringToTableCell(value, info.id.name));
  if (isNaN(id)) return null;
  const name = stringToTableCell(value, info.name.name);
  return {id, name};
}

/** По значение `TableRow` параметра создаёт модель пласта. */
export function createStratumModel(value: ParamValueTableRow, info: ChannelColumnInfo): StratumModel {
  const id = parseInt(stringToTableCell(value, info.id.name));
  if (isNaN(id)) return null;
  const name = stringToTableCell(value, info.name.name);
  return {id, name};
}

/** По значение `TableRow` параметра создаёт модель скважины. */
export function createWellModel(value: ParamValueTableRow, info: ChannelColumnInfo): WellModel {
  const id = parseInt(stringToTableCell(value, info.id.name));
  if (isNaN(id)) return null;
  const name = stringToTableCell(value, info.name.name);
  return {id, name};
}

/** По значение `TableRow` параметра создаёт модель трассы. */
export function createTraceModel(
  rowString: ParamValueTableRow,
  traceChannel: Channel, nodeChannel: Channel, wellChannel: Channel,
): TraceModel {
  const traceInfo = traceChannel.info.columns;
  const traceID = parseInt(stringToTableCell(rowString, traceInfo.id.name));

  const nodes: TraceNode[] = [];
  const nodeRows = nodeChannel.data?.rows;
  const wellRows = wellChannel.data?.rows;

  if (nodeRows) {
    const wellInfo = wellChannel.info.columns;
    const wellIDIndex = wellInfo.id.index;
    const wellNameIndex = wellInfo.name.index;

    const nodeInfo = nodeChannel.info.columns;
    const traceIDIndex = nodeInfo.traceID.index;
    const idIndex = nodeInfo.id.index;
    const xIndex = nodeInfo.x.index;
    const yIndex = nodeInfo.y.index;

    for (const { Cells: cells } of nodeRows) {
      if (cells[traceIDIndex] !== traceID) continue;
      const nodeID = parseInt(cells[idIndex]);
      const wellRow = wellRows?.find(row => row.Cells[wellIDIndex] === nodeID);
      const name = wellRow?.Cells[wellNameIndex] ?? null;
      nodes.push({id: nodeID, name: name, x: cells[xIndex], y: cells[yIndex]});
    }
  }

  return {
    id: traceID,
    name: stringToTableCell(rowString, traceInfo.name.name),
    place: parseInt(stringToTableCell(rowString, traceInfo.place.name)),
    nodes,
  };
}
