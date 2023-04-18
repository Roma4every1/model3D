import {tracesChannelName, wellsChannelName} from '../lib/constants';


export const traceChannelSelector = (state: WState) => {
  return state.channels[tracesChannelName];
};

export const traceStateSelector = (state: WState) => {
  return state.traces;
};

export const wellsChannelSelector = (state: WState) => {
  return state.channels[wellsChannelName];
};
