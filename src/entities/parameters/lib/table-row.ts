export function tableRowToString(channel: Channel, row: ChannelRow): string {
  if (!row) return null;

  const addParamRow = (properties, column: ChannelColumn, row: ChannelRow, index) => {
    let result = '';
    if (index !== 0) result = '|';
    result += addParam(column, row[index], column.name.toUpperCase());

    const propName = properties.find(p => p.fromColumn?.toUpperCase() === column.name.toUpperCase());
    if (propName) {
      result += '|' + addParam(column, row[index], propName.name.toUpperCase());
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
    ? propName + '#' + rowValue + '#' + column.type
    : propName + '##System.DBNull';
}

/* --- --- */

export function tableCellToString(channel: Channel, row: ChannelRow): string {
  const idIndex = channel.info.lookupColumns.id.index;
  const value = row[idIndex];
  if (value === null) return '#System.DBNull';
  return String(value) + '#' + channel.data.columns[idIndex].type;
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
