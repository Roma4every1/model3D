import { tracesChannelName } from '../lib/constants';


export const traceChannelSelector = (state: WState) => {
  return state.channels[tracesChannelName];
};
