export { channelAPI } from './lib/channel.api';
export { RecordInfoCreator } from './lib/criterion';

export { fillChannel, fillChannels } from './lib/utils';
export { createChannels } from './lib/factory';
export { createLookupList, createLookupTree } from './lib/lookup';
export { cellsToRecords, channelRowToRecord, getDetailChannels } from './lib/common';

export * from './store/channel.actions';
export * from './store/channel.store';
export * from './store/channel.thunks';
