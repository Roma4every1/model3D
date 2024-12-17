const inclLookupCriterion: PropertyChannelCriterion = {
  properties: {
    id: {name: 'LOOKUPCODE'}
  },
  required: true,
};

export const mapChannelCriteria: Record<string, ChannelCriterion> = {
  'maps': {
    properties: {
      id: {name: 'MAP_ID'}
    },
  },
  'incl-data': {
    name: 'Inclinometry',
    properties: {
      version: {name: 'VERSION', lookups: {ids: inclLookupCriterion}},
      depth: {name: 'DEPTH'},
      shift: {name: 'SHIFT'},
      shiftX: {name: 'SHIFTX'},
      shiftY: {name: 'SHIFTY'},
    },
  },
  'incl-props': {
    properties: {
      id: {name: 'VERSION_ORDER'},
      color: {name: 'COLOR'},
    },
  },
};
