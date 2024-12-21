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

/* --- Trace --- */

const traceNodeNameLookup: PropertyChannelCriterion = {
  properties: {
    id: {name: 'LOOKUPCODE'},
    name: {name: 'LOOKUPVALUE'},
  },
  required: false,
};

const traceNodeChannelCriterion: PropertyChannelCriterion<TraceNodeChannelFields> = {
  properties: {
    id: {name: 'ITEM', lookups: {name: traceNodeNameLookup}},
    x: {name: 'X'},
    y: {name: 'Y'},
    order: {name: 'SORTORDER'},
  },
  required: true,
};

/** Критерий канала с трассами. */
export const traceChannelCriterion: ChannelCriterion<keyof TraceModel> = {
  properties: {
    id: {name: 'LOOKUPCODE'},
    name: {name: 'LOOKUPVALUE'},
    nodes: {name: 'ITEMS', details: traceNodeChannelCriterion},
  },
};

/* --- Selection --- */

const selectionWellLookupCriterion: PropertyChannelCriterion = {
  properties: {
    id: {name: 'LOOKUPCODE'},
    name: {name: 'LOOKUPVALUE'},
    place: {name: ['PLACE', 'MEST'], required: false},
  },
  required: true,
};

const selectionPlaceLookupCriterion: PropertyChannelCriterion = {
  properties: {
    id: {name: 'LOOKUPCODE'},
    name: {name: 'LOOKUPVALUE'},
  },
  required: true,
};

const selectionItemChannelCriterion: PropertyChannelCriterion<keyof SelectionItem> = {
  properties: {
    id: {name: 'ITEM', lookups: {name: selectionWellLookupCriterion}},
    name: {name: 'NWELL'},
    place: {name: ['PLACE', 'MEST'], lookups: {name: selectionPlaceLookupCriterion}},
  },
  required: true,
};

export const selectionChannelCriterion: ChannelCriterion<keyof SelectionModel> = {
  properties: {
    id: {name: 'LOOKUPCODE'},
    name: {name: 'LOOKUPVALUE'},
    items: {name: 'ITEMS', details: selectionItemChannelCriterion},
  },
};

/* --- Site --- */

const sitePointChannelCriterion: PropertyChannelCriterion = {
  properties: {
    x: {name: 'X'},
    y: {name: 'Y'},
    order: {name: 'SORTORDER'},
  },
  required: true,
};

export const siteChannelCriterion: ChannelCriterion<keyof SiteModel> = {
  properties: {
    id: {name: 'LOOKUPCODE'},
    name: {name: 'LOOKUPVALUE'},
    points: {name: 'ITEMS', details: sitePointChannelCriterion},
  },
};
