export function tableRowToString(channel: Channel, row: ChannelRow): string {
  if (!row) return null;

  const addParamRow = (properties, column, row, index) => {
    let result = '';
    if (index !== 0) result = '|';

    result += addParam(column, row.Cells[index], column.Name.toUpperCase());

    const propName = properties.find(p => p.fromColumn?.toUpperCase() === column.Name.toUpperCase());
    if (propName) {
      result += '|' + addParam(column, row.Cells[index], propName.name.toUpperCase());
    }
    return result;
  }

  const valueString = channel.data.columns.map((column, i) => {
    return addParamRow(channel.info.properties, column, row, i);
  });
  return valueString.join('');
}

function addParam(column: ChannelColumn, rowValue: any, propName: string): string {
  return rowValue !== null
    ? propName + '#' + rowValue + '#' + column.NetType
    : propName + '##System.DBNull';
}

export function channelRowToString(row: ChannelRow, columns: ChannelColumn[]): string {
  const cells = row.Cells;
  const parts: string[] = [];

  for (let i = 0; i < columns.length; i++) {
    const cell = cells[i], column = columns[i];
    if (cell === null) {
      parts.push(`${column.Name}##System.DBNull`);
    } else {
      parts.push(`${column.Name}#${cell}#${column.NetType}`);
    }
  }
  return parts.join('|');
}

/* --- --- */

export function tableCellToString(channel: Channel, row: ChannelRow): string {
  const idIndex = channel.info.lookupColumns.id.index;
  const value = row.Cells[idIndex];
  if (value === null) return '#System.DBNull';
  return String(value) + '#' + channel.data.columns[idIndex].NetType;
}

export function stringToTableCell(rowString: string, columnName: string): string {
  const startIndex = rowString.indexOf(columnName + '#');
  const endIndex = rowString.indexOf('#', startIndex + columnName.length + 1);

  let dataValue;
  if (startIndex === -1) {
    dataValue = rowString;
  } else {
    dataValue = rowString.slice(startIndex + columnName.length + 1, endIndex === -1 ? undefined : endIndex);
  }
  return dataValue;
}
