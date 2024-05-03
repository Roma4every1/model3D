/** Критерий канала с месторождениями. */
export const placeChannelCriterion: ChannelCriterion<keyof PlaceModel> = {
  properties: {
    id: {name: 'LOOKUPCODE'},    // number
    name: {name: 'LOOKUPVALUE'}, // string
  },
};

/** Критерий канала с пластами. */
export const stratumChannelCriterion: ChannelCriterion<keyof StratumModel> = {
  properties: {
    id: {name: 'LOOKUPCODE'},    // number
    name: {name: 'LOOKUPVALUE'}, // string
  },
};

/** Критерий канала со скважинами. */
export const wellChannelCriterion: ChannelCriterion<keyof WellModel> = {
  properties: {
    id: {name: 'LOOKUPCODE'},    // number
    name: {name: 'LOOKUPVALUE'}, // string
  },
};

/** Набор свойств канала с узлами трасс. */
const traceNodePropertyCriteria: ChannelPropertyCriteria<TraceNodeChannelFields> = {
  traceID: {name: 'WELLS_LIST_ID', required: false},
  id: {name: 'ITEM'},
  x: {name: 'X'},
  y: {name: 'Y'},
  order: {name: 'SORTORDER'},
};
/** Критерий канала с трассами. */
export const traceChannelCriterion: ChannelCriterion<keyof TraceModel> = {
  name: 'traces',
  properties: {
    id: {name: 'LOOKUPCODE'},    // number
    place: {name: 'STRATUM'},    // string
    name: {name: 'LOOKUPVALUE'}, // string
    nodes: {name: 'ITEMS', details: {properties: traceNodePropertyCriteria}},
  },
};
