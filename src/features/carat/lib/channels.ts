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
  const result: CaratIntervalsInfo = {
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

/* --- --- */

type StrataAppearanceInfo = Record<keyof CaratStyleInterval, PropertyColumnInfo>;

export function findStrataAppearanceInfo(channel: Channel) {
  const result: StrataAppearanceInfo = {
    color: {name: 'COLOR', index: -1},
    borderColor: {name: 'BORDER COLOR', index: -1},
    backgroundColor: {name: 'BACKGROUND COLOR', index: -1},
    fillStyle: {name: 'FILL STYLE', index: -1},
    lineStyle: {name: 'LINE STYLE', index: -1},
  };
  channel.info.properties.forEach((property) => {
    let { name, fromColumn } = property;
    name = name.toUpperCase();
    if (name === 'COLOR') return result.color.name = fromColumn;
    if (name === 'BORDER COLOR') return result.borderColor.name = fromColumn;
    if (name === 'BACKGROUND COLOR') return result.backgroundColor.name = fromColumn;
    if (name === 'FILL STYLE') return result.fillStyle.name = fromColumn;
    if (name === 'LINE STYLE') return result.lineStyle.name = fromColumn;
  });
  return result;
}
