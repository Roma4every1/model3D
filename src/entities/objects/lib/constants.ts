/** Критерий канала с месторождениями. */
export const placeChannelCriterion: ChannelCriterion<keyof PlaceModel> = {
  properties: {
    id: {name: 'LOOKUPCODE'},                 // number
    code: {name: 'OBJNAME', required: false}, // string
    name: {name: 'LOOKUPVALUE'},              // string
  },
};

/** Критерий канала с пластами. */
export const stratumChannelCriterion: ChannelCriterion<keyof StratumModel> = {
  properties: {
    id: {name: 'LOOKUPCODE'},
    name: {name: 'LOOKUPVALUE'},
  },
};

/** Критерий канала со скважинами. */
export const wellChannelCriterion: ChannelCriterion<keyof WellModel> = {
  properties: {
    id: {name: 'LOOKUPCODE'},
    name: {name: 'LOOKUPVALUE'},
  },
};

/** Набор свойств канала с узлами трасс. */
const traceNodePropertyCriteria: ChannelPropertyCriteria<TraceNodeChannelFields> = {
  traceID: {name: /^(?:TRACE|WELLS_LIST)_ID$/, required: false},
  id: {name: 'ITEM'},
  x: {name: 'X'},
  y: {name: 'Y'},
  order: {name: 'SORTORDER'},
};
/** Критерий канала с трассами. */
export const traceChannelCriterion: ChannelCriterion<keyof TraceModel> = {
  name: 'traces',
  properties: {
    id: {name: 'LOOKUPCODE'},
    name: {name: 'LOOKUPVALUE'},
    nodes: {name: 'ITEMS', details: {properties: traceNodePropertyCriteria}},
  },
};
