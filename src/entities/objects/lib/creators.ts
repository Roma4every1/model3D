import { placeCriterion, stratumCriterion, wellCriterion, traceCriterion } from './constants';


/** По значение `TableRow` параметра создаёт модель месторождения. */
export function createPlaceModel(value: ParameterValueMap['tableRow']): PlaceModel {
  const id = Number(value[placeCriterion.id as string]?.value);
  if (isNaN(id)) return null;

  const name = value[placeCriterion.name as string]?.value;
  const criterionObjectName = placeCriterion.objectName as {name: string; optional: boolean };
  const objectName = value[criterionObjectName.name]?.value;

  return {id, name, objectName};
}

/** По значение `TableRow` параметра создаёт модель пласта. */
export function createStratumModel(value: ParameterValueMap['tableRow']): StratumModel {
  const id = Number(value[stratumCriterion.id as string]?.value);
  if (isNaN(id)) return null;
  const name = value[stratumCriterion.name as string]?.value;
  return {id, name};
}

/** По значение `TableRow` параметра создаёт модель скважины. */
export function createWellModel(value: ParameterValueMap['tableRow']): WellModel {
  const id = Number(value[wellCriterion.id as string]?.value);
  if (isNaN(id)) return null;
  const name = value[wellCriterion.name as string]?.value;
  return {id, name};
}

/** По значение `TableRow` параметра создаёт модель трассы. */
export function createTraceModel(
  value: ParameterValueMap['tableRow'],
  nodeChannel: Channel, wellChannel: Channel,
): TraceModel {
  const traceID = Number(value[traceCriterion.id as string]?.value);

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

    for (const cells of nodeRows) {
      if (cells[traceIDIndex] !== traceID) continue;
      const nodeID = parseInt(cells[idIndex]);
      const wellRow = wellRows?.find(row => row[wellIDIndex] === nodeID);
      const name = wellRow ? wellRow[wellNameIndex] : null;
      nodes.push({id: nodeID, name: name, x: cells[xIndex], y: cells[yIndex]});
    }
  }

  return {
    id: traceID,
    name: value[traceCriterion.name as string]?.value,
    place: Number(value[traceCriterion.place as string]?.value),
    nodes,
  };
}
