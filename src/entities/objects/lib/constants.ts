/** Набор свойств канала с месторождениями. */
export const placeCriterion: ChannelCriterion<keyof PlaceModel> = {
  id: 'LOOKUPCODE',    // number
  name: 'LOOKUPVALUE', // string
  objectName: 'OBJNAME',  // string
};

/** Набор свойств канала с пластами. */
export const stratumCriterion: ChannelCriterion<keyof StratumModel> = {
  id: 'LOOKUPCODE',    // number
  name: 'LOOKUPVALUE', // string
};

/** Набор свойств канала со скважинами. */
export const wellCriterion: ChannelCriterion<keyof WellModel> = {
  id: 'LOOKUPCODE',    // number
  name: 'LOOKUPVALUE', // string
};

/** Набор свойств канала с трассами. */
export const traceCriterion: ChannelCriterion<keyof TraceModel> = {
  id: 'LOOKUPCODE',    // number
  place: 'STRATUM',    // string
  name: 'LOOKUPVALUE', // string
  nodes: 'ITEMS',      // string
};

/** Набор свойств канала с узлами трасс. */
export const traceNodeCriterion: ChannelCriterion = {
  id: 'ITEM',          // string
  x: 'X',              // number
  y: 'Y',              // number
  order: 'SORTORDER',  // number
};

/** Фиксированное название канала с трассами. */
export const traceChannelName: ChannelName = 'traces';
