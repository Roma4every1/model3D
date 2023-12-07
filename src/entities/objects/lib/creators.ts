import { stringToTableCell } from '../../parameters/lib/table-row';
import { placeCriterion, stratumCriterion, wellCriterion, traceCriterion } from './constants';


/** По значение `TableRow` параметра создаёт модель месторождения. */
export function createPlaceModel(value: ParamValueTableRow): PlaceModel {
  const id = parseInt(stringToTableCell(value, placeCriterion.id as string));
  if (isNaN(id)) return null;
  const name = stringToTableCell(value, placeCriterion.name as string);
  const objectName = stringToTableCell(value, placeCriterion.objectName as string);
  return {id, name, objectName};
}

/** По значение `TableRow` параметра создаёт модель пласта. */
export function createStratumModel(value: ParamValueTableRow): StratumModel {
  const id = parseInt(stringToTableCell(value, stratumCriterion.id as string));
  if (isNaN(id)) return null;
  const name = stringToTableCell(value, stratumCriterion.name as string);
  return {id, name};
}

/** По значение `TableRow` параметра создаёт модель скважины. */
export function createWellModel(value: ParamValueTableRow): WellModel {
  const id = parseInt(stringToTableCell(value, wellCriterion.id as string));
  if (isNaN(id)) return null;
  const name = stringToTableCell(value, wellCriterion.name as string);
  return {id, name};
}

/** По значение `TableRow` параметра создаёт модель трассы. */
export function createTraceModel(
  rowString: ParamValueTableRow,
  nodeChannel: Channel, wellChannel: Channel,
): TraceModel {
  const traceID = parseInt(stringToTableCell(rowString, traceCriterion.id as string));

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
    name: stringToTableCell(rowString, traceCriterion.name as string),
    place: parseInt(stringToTableCell(rowString, traceCriterion.place as string)),
    nodes,
  };
}
