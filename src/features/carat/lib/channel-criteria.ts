export const rectStyle: PropertyChannelCriterion = {
  properties: {
    id: {name: 'LOOKUPCODE'},
    color: {name: 'COLOR'},
    borderColor: {name: 'BORDER COLOR'},
    backgroundColor: {name: 'BACKGROUND COLOR'},
    fillStyle: {name: 'FILL STYLE'},
    lineStyle: {name: 'LINE STYLE'},
  },
  required: false,
};

/* --- --- */

const inclinometryData: PropertyChannelCriterion = {
  properties: {
    well: {name: 'WELL ID'},
    depth: {name: 'DEPTH'},
    absMark: {name: 'ABSMARK'},
  },
  required: true,
};

const stratumNameLookup: PropertyChannelCriterion = {
  properties: {
    id: {name: 'LOOKUPCODE'},
    name: {name: 'LOOKUPVALUE'},
  },
  required: false,
};

const curveColorLookupCriterion: PropertyChannelCriterion = {
  properties: {
    type: {name: 'LOOKUPCODE'},
    color: {name: 'COLOR'},
  },
  required: false,
};

const imageLookup: PropertyChannelCriterion = {
  properties: {
    id: {name: 'LOOKUPCODE'},
    image: {name: 'LOOKUPVALUE'},
  },
  required: true,
};

export const caratChannelCriteria: Record<CaratChannelType, ChannelCriterion> = {
  'inclinometry': {
    properties: {
      well: {name: 'WELL ID'},
      inclinometry: {name: 'INCLINOMETRY', details: inclinometryData},
    },
  },
  'lithology': {
    properties: {
      well: {name: 'WELL ID'},
      top: {name: 'TOP'},
      bottom: {name: 'BASE'},
      stratumID: {name: 'STRATUM ID', lookups: {name: stratumNameLookup}},
    },
  },
  'perforation': {
    properties: {
      well: {name: 'WELL ID'},
      top: {name: 'TOP'},
      bottom: {name: 'BASE'},
      type: {name: 'TYPE'},
      date: {name: 'DATE'},
    },
  },
  'curve': {
    properties: {
      well: {name: 'WELL ID'},
      id: {name: 'CURVE ID'},
      top: {name: 'DEPTH START'},
      bottom: {name: 'DEPTH END'},
      type: {name: 'CURVE TYPE', lookups: {color: curveColorLookupCriterion}},
      date: {name: 'DATE'},
      defaultLoading: {name: 'LOAD BY DEFAULT'},
      description: {name: 'DESCRIPTION', required: false},
    },
  },
  'curve-data': {
    properties: {
      id: {name: 'CURVE ID'},
      data: {name: 'CURVE DATA'},
      top: {name: 'MIN DEPTH'},
      bottom: {name: 'MAX DEPTH'},
      min: {name: 'MIN VALUE'},
      max: {name: 'MAX VALUE'},
    },
  },
  'mark': {
    properties: {
      well: {name: 'WELL ID'},
      depth: {name: 'DEPTH'},
      text: {name: 'TEXT'},
    },
  },
  'bore': {
    properties: {
      well: {name: 'WELL ID'},
      top: {name: 'TOP'},
      bottom: {name: 'BASE'},
      innerDiameter: {name: 'IN_D'},
      outerDiameter: {name: 'OUT DIAMETER'},
      cement: {name: 'CEMENT'},
      label: {name: 'LABEL_ZEM'},
    },
  },
  'image': {
    properties: {
      well: {name: 'WELL ID'},
      top: {name: 'TOP'},
      bottom: {name: 'BASE'},
      imageID: {name: 'PUMP IMAGE', lookups: {image: imageLookup}},
      label: {name: 'LABEL_SP'},
    },
  },
  'face': {
    properties: {
      well: {name: 'WELL ID'},
      top: {name: 'TOP'},
      bottom: {name: 'BASE'},
      diameter: {name: 'OUT_D'},
      type: {name: 'TYPE', lookups: {style: rectStyle}},
      date: {name: 'DT'},
      label: {name: 'LABEL_ZB'},
    },
  },
  'vertical': {
    properties: {
      well: {name: 'WELL ID'},
      top: {name: 'TOP'},
      bottom: {name: 'BASE'},
      width: {name: 'WIDTH'},
    },
  },
};
