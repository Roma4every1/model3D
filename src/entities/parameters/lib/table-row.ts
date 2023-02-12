const addParam = (column: ChannelColumn, rowValue: any, propName: string) => {
  return rowValue !== null
    ? propName + '#' + rowValue + '#' + column.NetType
    : propName + '##System.DBNull';
};

export function tableRowToString(channel: Channel, row: ChannelRow) {
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

  const columns = channel.data.columns;
  const editorColumns = channel.info.editorColumns;

  const valueString = [];
  columns.forEach((column, index) => {
    valueString.push(addParamRow(channel.info.properties, column, row, index));
  });

  return {
    id: row.Cells[editorColumns.lookupCode.index],
    name: row.Cells[editorColumns.lookupValue.index] ?? '',
    value: valueString.join(''),
  };
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
