export { channelAPI } from './lib/channel.api';
export { RecordInfoCreator } from './lib/criterion';

export { fillChannel, fillChannels } from './lib/utils';
export { createChannel, createChannels } from './lib/factory';
export { cellsToRecords, channelRowToRecord } from './lib/common';
export { createLookupMap, createLookupList, createLookupTree } from './lib/lookup';

export * from './store/channel.actions';
export * from './store/channel.store';
export * from './store/channel.thunks';
