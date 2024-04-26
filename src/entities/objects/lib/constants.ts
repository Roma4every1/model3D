/** Критерий канала с месторождениями. */
export const placeChannelCriterion: ChannelCriterion2<keyof PlaceModel> = {
  properties: {
    id: {name: 'LOOKUPCODE'},    // number
    name: {name: 'LOOKUPVALUE'}, // string
  },
};

/** Критерий канала с пластами. */
export const stratumChannelCriterion: ChannelCriterion2<keyof StratumModel> = {
  properties: {
    id: {name: 'LOOKUPCODE'},    // number
    name: {name: 'LOOKUPVALUE'}, // string
  },
};

/** Критерий канала со скважинами. */
export const wellChannelCriterion: ChannelCriterion2<keyof WellModel> = {
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
export const traceChannelCriterion: ChannelCriterion2<keyof TraceModel> = {
  name: 'traces',
  properties: {
    id: {name: 'LOOKUPCODE'},    // number
    place: {name: 'STRATUM'},    // string
    name: {name: 'LOOKUPVALUE'}, // string
    nodes: {name: 'ITEMS', details: {properties: traceNodePropertyCriteria}},
  },
};
