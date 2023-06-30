/** Фиксированное название канала с трассами. */
export const traceChannelName: ChannelName = 'traces';

/** Набор свойств канала с месторождениями. */
export const placeCriterion: ChannelCriterion<'id' | 'name'> = {
  id: 'LOOKUPCODE',    // number
  name: 'LOOKUPVALUE', // string
};

/** Набор свойств канала со скважинами. */
export const wellCriterion: ChannelCriterion<'id' | 'name'> = {
  id: 'LOOKUPCODE',    // number
  name: 'LOOKUPVALUE', // string
};

/** Набор свойств канала с трассами. */
export const traceCriterion: ChannelCriterion<'id' | 'place' | 'name'  | 'nodes'> = {
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
