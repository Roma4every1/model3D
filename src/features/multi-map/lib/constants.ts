/** Критерий канала мультикарты. */
export const multiMapChannelCriterion: ChannelCriterion = {
  properties: {
    id: {name: 'MAP_ID'},
    storage: {name: 'OWNER', required: false},
    stratumName: {name: 'PLAST_NAME'},
  },
};
