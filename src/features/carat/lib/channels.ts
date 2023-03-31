// /** Канал геометрии скважин.
//  * Свойства: WELL ID, DEPTH, ABS MARK.
//  * */
// export function isGeometryChannel(channel: Channel): boolean {
//   const propertyNames = channel.info.properties.map((property) => property.name.toUpperCase());
//   const hasDepth = propertyNames.some((name) => name === 'DEPTH');
//   return hasDepth && propertyNames.some((name) => name === 'ABSMARK');
// }

/** Канал литологии.
 * Свойства: WELL ID, STRATUM ID, TOP, BASE.
 * */
export function isLithologyChannel(channel: Channel): boolean {
  const propertyNames = channel.info.properties.map((property) => property.name.toUpperCase());
  const hasTop = propertyNames.some((name) => name === 'TOP');
  return hasTop && propertyNames.some((name) => name === 'BASE');
}

/* --- --- */

export function findLithologyIndexes(channel: Channel): CaratIntervalsInfo {
  const result = {
    top: {name: 'TOP', index: -1},
    base: {name: 'BASE', index: -1},
  };
  channel.info.properties.forEach((property) => {
    const { name, fromColumn } = property;
    if (name === 'TOP') return result.top.name = fromColumn;
    if (name === 'BASE') return result.base.name = fromColumn;
  });
  return result;
}

export function getCaratIntervals(rows: ChannelRow[], indexes: CaratIntervalsInfo) {
  const topIndex = indexes.top.index;
  const baseIndex = indexes.base.index;

  return rows.map((row): CaratRenderedInterval => {
    const top = parseFloat(row.Cells[topIndex]?.replace(',', '.'));
    const base = parseFloat(row.Cells[baseIndex]?.replace(',', '.'));
    return {top, base};
  });
}
