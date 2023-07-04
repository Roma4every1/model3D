import { createColumnInfo } from '../../channels/lib/common';
import { createPlaceModel, createTraceModel, createWellModel } from './creators';

import {
  traceChannelName,
  traceCriterion, traceNodeCriterion, wellCriterion, placeCriterion,
} from './constants';


export function createObjects(state: WState): ObjectsState {
  const well = createWellState(state);
  const trace = createTraceState(state);
  const place = createPlaceState(state, trace);
  return {place, well, trace};
}

function createWellState(state: WState): WellState {
  const rootParameters = state.parameters[state.root.id];
  const wellParameter = rootParameters.find(p => p.id === 'wellCurrent' || p.id === 'currentWell');

  const wellChannelName = wellParameter.externalChannelName;
  const wellChannel = state.channels[wellChannelName];
  if (wellChannel) wellChannel.info.columns = createColumnInfo(wellChannel, wellCriterion);

  return {
    channelName: wellParameter.externalChannelName,
    parameterID: wellParameter.id, model: null,
  };
}

function createTraceState(state: WState): TraceState {
  let channelName: ChannelName = null, nodeChannelName: ChannelName = null;
  let parameterID: ParameterID = null;

  const traceChannel = state.channels[traceChannelName];
  if (traceChannel) {
    traceChannel.info.columns = createColumnInfo(traceChannel, traceCriterion);
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
    }
  }

  return {
    channelName, nodeChannelName, parameterID,
    model: null, oldModel: null, creating: false, editing: false,
  };
}

function createPlaceState(state: WState, traceState: TraceState): PlaceState {
  const rootParameters = state.parameters[state.root.id];
  const traceParameter = rootParameters.find(p => p.id === traceState.parameterID);
  const placeParameterID = traceParameter.dependsOn[0];
  const placeParameter = rootParameters.find(p => p.id === placeParameterID);

  const placeChannel = state.channels[placeParameter.externalChannelName];
  placeChannel.info.columns = createColumnInfo(placeChannel, placeCriterion);
  return {channelName: placeChannel.name, parameterID: placeParameterID, model: null};
}

export function createObjectModels(state: WState): ObjectsState {
  const { objects, parameters, channels } = state;
  let { place, well, trace } = objects;
  const rootParameters = parameters[state.root.id];

  const placeChannel = channels[place.channelName];
  const placeParameter = rootParameters.find(p => p.id === place.parameterID);
  const placeRowString = placeParameter.value as ParamValueTableRow;
  if (placeRowString) {
    const model = createPlaceModel(placeRowString, placeChannel.info.columns);
    place = {...place, model};
  }

  const wellChannel = channels[well.channelName];
  const wellParameter = rootParameters.find(p => p.id === well.parameterID);
  const wellRowString = wellParameter.value as ParamValueTableRow;
  if (wellRowString) {
    const model = createWellModel(wellRowString, wellChannel.info.columns);
    well = {...well, model};
  }

  const traceChannel = channels[trace.channelName];
  const nodeChannel = channels[trace.nodeChannelName];
  const traceParameter = rootParameters.find(p => p.id === trace.parameterID);
  const traceRowString = traceParameter.value as ParamValueTableRow;
  if (traceRowString) {
    const model = createTraceModel(traceRowString, traceChannel, nodeChannel, wellChannel);
    trace = {...trace, model};
  }

  return {place, well, trace};
}
