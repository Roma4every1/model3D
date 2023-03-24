export {};

/*
канал литология.
свойства: WELL ID, STRATUM ID, TOP, BASE
*/

interface PropertyColumnInfo {
  name: string,
  index: number,
}

interface LithologyObject {
  top: number,
  base: number,
}

interface LithologyChannelColumns {
  wellID: PropertyColumnInfo,
  stratumID: PropertyColumnInfo,
  top: PropertyColumnInfo,
  base: PropertyColumnInfo,
}

export function findLithologyIndexes(channel: Channel) {
  const result: LithologyChannelColumns = {
    wellID: {name: 'WELL ID', index: -1},
    stratumID: {name: 'STRATUM ID', index: -1},
    top: {name: 'TOP', index: -1},
    base: {name: 'BASE', index: -1},
  };
  channel.info.properties.forEach((property) => {
    const { name, fromColumn } = property;
    if (name === 'WELL ID') return result.wellID.name = fromColumn;
    if (name === 'STRATUM ID') return result.wellID.name = fromColumn;
    if (name === 'TOP') return result.top.name = fromColumn;
    if (name === 'BASE') return result.base.name = fromColumn;
  });
  channel.data.columns.forEach(({ Name: name }, i) => {
    if (name === result.wellID.name) return result.wellID.index = i;
    if (name === result.stratumID.name) return result.stratumID.index = i;
    if (name === result.top.name) return result.base.index = i;
    if (name === result.base.name) return result.base.index = i;
  });
  return result;
}

export function getLithologyObjects(rows: ChannelRow[], indexes: LithologyChannelColumns) {
  const topIndex = indexes.top.index;
  const baseIndex = indexes.base.index;

  return rows.map((row) => {
    const top = parseFloat(row[topIndex].replace(',', '.'));
    const base = parseFloat(row[baseIndex].replace(',', '.'));
    return {top, base};
  });
}
