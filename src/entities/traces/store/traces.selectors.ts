import {tracesChannelName} from '../lib/constants';
import {stringToTableCell} from "../../parameters/lib/table-row";


export const traceChannelSelector = (state: WState): Channel => {
  return state.channels[tracesChannelName];
};

export const traceStateSelector = (state: WState) => {
  return state.traces;
};

export function currentTraceParamSelector (this: string, state: WState) {
  return state.parameters[state.root.id]
    .find(el => el.id === this)
    ?.value?.toString() || null;
}

export function currentStratumIDSelector (this: string, state: WState) : string | null {
  const traces = state.channels[tracesChannelName];
  if (!traces) return null;
  const currentTraceParamName = traces.info.currentRowObjectName;
  const currentTraceParam = state.parameters[state.root.id].find(p => p.id === currentTraceParamName);

  const currentMestParamName = currentTraceParam.dependsOn[0];
  const currentMestParam = state.parameters[state.root.id].find(p => p.id === currentMestParamName)
  const currentMestValue = currentMestParam?.value?.toString() || null
  return currentMestValue ?
    stringToTableCell(currentMestValue, 'LOOKUPCODE') : null;
}

export function traceItemsChannelSelector (state: WState): Channel {
  const traces = state.channels[tracesChannelName];
  const traceItemsChannelName = traces?.info?.properties[3]?.secondLevelChannelName;
  return state.channels[traceItemsChannelName];
}

export function wellsChannelSelector (state: WState): Channel {
  const traces = state.channels[tracesChannelName];
  const traceItemsChannelName = traces?.info?.properties[3]?.secondLevelChannelName;
  const itemsChannel = state.channels[traceItemsChannelName];
  return state.channels[itemsChannel.info.lookupChannels[0]];
}

