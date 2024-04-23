import { useParameterStore } from 'entities/parameter';
import { useChannelStore, createColumnInfo } from 'entities/channel';
import { useObjectsStore } from '../store/objects.store';

import {
  createPlaceModel, createStratumModel,
  createWellModel, createTraceModel,
} from './creators';

import {
  placeCriterion, stratumCriterion, wellCriterion,
  traceCriterion, traceNodeCriterion, traceChannelName,
} from './constants';


export function createObjects(): ObjectsState {
  const well = createWellState();
  const trace = createTraceState();
  const place = createPlaceState(trace);
  const stratum = createStratumState();
  return {place, stratum, well, trace};
}

function createStratumState(): StratumState {
  let channelName: ChannelName = null, parameterID: ParameterID = null;
  const rootParameters = useParameterStore.getState().root;
  const stratumParameter = rootParameters.find(p => p.id === 'currentPlast');

  if (stratumParameter) {
    channelName = stratumParameter.channelName;
    parameterID = stratumParameter.id;

    const stratumChannel = useChannelStore.getState()[channelName];
    if (stratumChannel) {
      stratumChannel.info.columns = createColumnInfo(stratumChannel, stratumCriterion);
    } else {
      channelName = null;
    }
  }
  return {channelName, parameterID, model: null};
}

function createWellState(): WellState {
  let channelName: ChannelName = null, parameterID: ParameterID = null;
  const rootParameters = useParameterStore.getState().root;
  const wellParameter = rootParameters.find(p => p.id === 'wellCurrent' || p.id === 'currentWell');

  if (wellParameter) {
    channelName = wellParameter.channelName;
    parameterID = wellParameter.id;

    const wellChannel = useChannelStore.getState()[channelName];
    if (wellChannel) {
      wellChannel.info.columns = createColumnInfo(wellChannel, wellCriterion);
    } else {
      channelName = null;
    }
  }
  return {channelName, parameterID, model: null};
}

function createTraceState(): TraceState {
  const channels = useChannelStore.getState();
  let channelName: ChannelName = null, nodeChannelName: ChannelName = null;
  let parameterID: ParameterID = null;

  const traceChannel = channels[traceChannelName];
  if (traceChannel) {
    traceChannel.info.columns = createColumnInfo(traceChannel, traceCriterion);
    channelName = traceChannel.name;
    parameterID = traceChannel.info.currentRowObjectName;

    const nodeProperty = traceChannel.info.properties.find(p => p.name.toUpperCase() === 'ITEMS');
    if (nodeProperty) nodeChannelName = nodeProperty.secondLevelChannelName;
    const nodeChannel = channels[nodeChannelName];

    if (nodeChannel) {
      const nodeInfo = createColumnInfo(nodeChannel, traceNodeCriterion);
      nodeInfo.traceID = {name: 'WELLS_LIST_ID', index: -1};
      nodeChannel.info.columns = nodeInfo;
    }
  }

  return {
    channelName, nodeChannelName, parameterID,
    model: null, oldModel: null, creating: false, editing: false,
  };
}

function createPlaceState(traceState: TraceState): PlaceState {
  const rootParameters = useParameterStore.getState().root;
  const traceParameter = rootParameters.find(p => p.id === traceState.parameterID);
  const placeParameterID = traceParameter?.dependsOn[0];
  if (!placeParameterID) return {channelName: null, parameterID: null, model: null};

  const placeParameter = rootParameters.find(p => p.id === placeParameterID);
  const placeChannel = useChannelStore.getState()[placeParameter.channelName];
  placeChannel.info.columns = createColumnInfo(placeChannel, placeCriterion);
  return {channelName: placeChannel.name, parameterID: placeParameterID, model: null};
}

export function createObjectModels(): ObjectsState {
  const channels = useChannelStore.getState();
  const objects = useObjectsStore.getState();

  let { place, stratum, well, trace } = objects;
  const rootParameters = useParameterStore.getState().root;

  if (place.channelName && place.parameterID) {
    const placeParameter = rootParameters.find(p => p.id === place.parameterID);
    const placeRow = placeParameter.getValue() as ParameterValueMap['tableRow'];
    if (placeRow) {
      const model = createPlaceModel(placeRow);
      place = {...place, model};
    }
  }

  if (stratum.channelName && stratum.parameterID) {
    const stratumParameter = rootParameters.find(p => p.id === stratum.parameterID);
    const stratumRow = stratumParameter.getValue() as ParameterValueMap['tableRow'];
    if (stratumRow) {
      const model = createStratumModel(stratumRow);
      stratum = {...stratum, model};
    }
  }

  const wellChannel = channels[well.channelName];
  const wellParameter = rootParameters.find(p => p.id === well.parameterID);
  const wellRow = wellParameter.getValue() as ParameterValueMap['tableRow'];

  if (wellRow) {
    const model = createWellModel(wellRow);
    well = {...well, model};
  }

  if (trace.channelName && trace.parameterID) {
    const nodeChannel = channels[trace.nodeChannelName];
    const traceParameter = rootParameters.find(p => p.id === trace.parameterID);
    const traceRow = traceParameter.getValue() as ParameterValueMap['tableRow'];
    if (traceRow) {
      const model = createTraceModel(traceRow, nodeChannel, wellChannel);
      trace = {...trace, model};
    }
  }

  return {place, stratum, well, trace};
}
