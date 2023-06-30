import { createColumnInfo, findColumnIndexes } from '../../channels/lib/common';
import { createPlaceModel, createWellModel, createTraceModel } from './creators';

import {
  traceChannelName,
  traceCriterion, traceNodeCriterion, wellCriterion, placeCriterion,
} from './constants';


export function createObjects(state: WState): ObjectsState {
  const well = createWellState(state);
  const trace = createTraceState(state, well);
  const place = createPlaceState(state, trace);
  return {place, well, trace};
}

function createWellState(state: WState): WellState {
  const rootParameters = state.parameters[state.root.id];
  const wellParameter = rootParameters.find(p => p.id === 'wellCurrent' || p.id === 'currentWell');

  const wellChannelName = wellParameter.externalChannelName;
  const wellChannel = state.channels[wellChannelName];

  if (wellChannel) {
    wellChannel.info.columns = createColumnInfo(wellChannel, wellCriterion);
    findColumnIndexes(wellChannel);
  }

  let well: WellModel = null;
  const rowString = wellParameter.value as ParamValueTableRow;
  if (rowString) well = createWellModel(rowString, wellChannel.info.columns);

  return {
    channelName: wellParameter.externalChannelName,
    parameterID: wellParameter.id,
    model: well,
  };
}

function createTraceState(state: WState, wellState: WellState): TraceState {
  let channelName: ChannelName = null, nodeChannelName: ChannelName = null;
  let parameterID: ParameterID = null;
  let trace: TraceModel = null;

  const traceChannel = state.channels[traceChannelName];
  if (traceChannel) {
    traceChannel.info.columns = createColumnInfo(traceChannel, traceCriterion);
    findColumnIndexes(traceChannel);

    channelName = traceChannel.name;
    parameterID = traceChannel.info.currentRowObjectName;

    const nodeProperty = traceChannel.info.properties.find(p => p.name.toUpperCase() === 'ITEMS');
    if (nodeProperty) nodeChannelName = nodeProperty.secondLevelChannelName;

    let nodeInfo: ChannelColumnInfo;
    const nodeChannel = state.channels[nodeChannelName];

    if (nodeChannel) {
      nodeInfo = createColumnInfo(nodeChannel, traceNodeCriterion);
      nodeInfo.traceID = {name: 'WELLS_LIST_ID', index: -1};
      nodeChannel.info.columns = nodeInfo;
      findColumnIndexes(nodeChannel);
    }

    if (parameterID) {
      const parameter = state.parameters[state.root.id].find(p => p.id === parameterID);
      const value = parameter?.value as ParamValueTableRow;

      const wellChannel = state.channels[wellState.channelName];
      if (value) trace = createTraceModel(value, traceChannel, nodeChannel, wellChannel);
    }
  }

  return {
    channelName, nodeChannelName, parameterID,
    model: trace, oldModel: null, creating: false, editing: false,
  };
}

function createPlaceState(state: WState, traceState: TraceState): PlaceState {
  const rootParameters = state.parameters[state.root.id];
  const traceParameter = rootParameters.find(p => p.id === traceState.parameterID);
  const placeParameterID = traceParameter.dependsOn[0];
  const placeParameter = rootParameters.find(p => p.id === placeParameterID);

  const placeChannel = state.channels[placeParameter.externalChannelName];
  const columnInfo = createColumnInfo(placeChannel, placeCriterion);
  placeChannel.info.columns = columnInfo;
  findColumnIndexes(placeChannel);

  let model: PlaceModel = null;
  const rowString = placeParameter.value as ParamValueTableRow;
  if (placeParameter.value) model = createPlaceModel(rowString, columnInfo);

  return {
    channelName: placeChannel.name,
    parameterID: placeParameterID,
    model,
  };
}
