import { createColumnInfo } from '../../channels';

import {
  createPlaceModel, createStratumModel,
  createWellModel, createTraceModel,
} from './creators';

import {
  placeCriterion, stratumCriterion, wellCriterion,
  traceCriterion, traceNodeCriterion, traceChannelName,
} from './constants';


export function createObjects(state: WState): ObjectsState {
  const well = createWellState(state);
  const trace = createTraceState(state);
  const place = createPlaceState(state, trace);
  const stratum = createStratumState(state);
  return {place, stratum, well, trace};
}

function createStratumState(state: WState): StratumState {
  let channelName: ChannelName = null, parameterID: ParameterID = null;
  const rootParameters = state.parameters[state.root.id];
  const stratumParameter = rootParameters.find(p => p.id === 'currentPlast');

  if (stratumParameter) {
    channelName = stratumParameter.externalChannelName;
    parameterID = stratumParameter.id;

    const stratumChannel = state.channels[channelName];
    if (stratumChannel) {
      stratumChannel.info.columns = createColumnInfo(stratumChannel, stratumCriterion);
    } else {
      channelName = null;
    }
  }
  return {channelName, parameterID, model: null};
}

function createWellState(state: WState): WellState {
  let channelName: ChannelName = null, parameterID: ParameterID = null;
  const rootParameters = state.parameters[state.root.id];
  const wellParameter = rootParameters.find(p => p.id === 'wellCurrent' || p.id === 'currentWell');

  if (wellParameter) {
    channelName = wellParameter.externalChannelName;
    parameterID = wellParameter.id;

    const wellChannel = state.channels[channelName];
    if (wellChannel) {
      wellChannel.info.columns = createColumnInfo(wellChannel, wellCriterion);
    } else {
      channelName = null;
    }
  }
  return {channelName, parameterID, model: null};
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
  const placeParameterID = traceParameter?.dependsOn[0];
  if (!placeParameterID) return {channelName: null, parameterID: null, model: null};

  const placeParameter = rootParameters.find(p => p.id === placeParameterID);
  const placeChannel = state.channels[placeParameter.externalChannelName];
  placeChannel.info.columns = createColumnInfo(placeChannel, placeCriterion);
  return {channelName: placeChannel.name, parameterID: placeParameterID, model: null};
}

export function createObjectModels(state: WState): ObjectsState {
  const { objects, parameters, channels } = state;
  let { place, stratum, well, trace } = objects;
  const rootParameters = parameters[state.root.id];

  if (place.channelName && place.parameterID) {
    const placeParameter = rootParameters.find(p => p.id === place.parameterID);
    const placeRowString = placeParameter.value as ParamValueTableRow;
    if (placeRowString) {
      const model = createPlaceModel(placeRowString);
      place = {...place, model};
    }
  }

  if (stratum.channelName && stratum.parameterID) {
    const stratumParameter = rootParameters.find(p => p.id === stratum.parameterID);
    const stratumRowString = stratumParameter.value as ParamValueTableRow;
    if (stratumRowString) {
      const model = createStratumModel(stratumRowString);
      stratum = {...stratum, model};
    }
  }

  const wellChannel = channels[well.channelName];
  const wellParameter = rootParameters.find(p => p.id === well.parameterID);
  const wellRowString = wellParameter.value as ParamValueTableRow;
  if (wellRowString) {
    const model = createWellModel(wellRowString);
    well = {...well, model};
  }

  if (trace.channelName && trace.parameterID) {
    const nodeChannel = channels[trace.nodeChannelName];
    const traceParameter = rootParameters.find(p => p.id === trace.parameterID);
    const traceRowString = traceParameter.value as ParamValueTableRow;
    if (traceRowString) {
      const model = createTraceModel(traceRowString, nodeChannel, wellChannel);
      trace = {...trace, model};
    }
  }

  return {place, stratum, well, trace};
}
