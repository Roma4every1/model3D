import { ThunkDispatch } from 'redux-thunk';
import { insertRows, updateRows } from 'entities/channels';
import calculateSize from 'calculate-size';


interface TableColumnInfo {
  field: string,
  fromColumn: string,
  netType: string,
  headerName: string,
  lookupChannelName?: ChannelName,
  treePath: string[]
  locked?: boolean,
}
type ColumnFilterType = 'text' | 'numeric' | 'date';


export function getFilterByType(type: string | null | undefined): ColumnFilterType {
  if (!type) return 'text';
  type = type.substring(7); // 'System.Type'
  if (type.startsWith('Date')) return 'date';
  if (type.startsWith('Int') || type.startsWith('D')) return 'numeric';
  return 'text';
}

/* --- --- --- */

const textOptions = {font: 'Arial', fontSize: '14px'};

export function getColumnWidth(header: string, field: string, rows: any[]): number {
  let maxWidth = calculateSize(header, textOptions).width + 10;
  for (const row of rows) {
    let value = row[field];
    if (value instanceof Date) value = value.toLocaleDateString();
    const size = calculateSize(value, textOptions);
    if (size.width > maxWidth) maxWidth = size.width;
  }
  return maxWidth + 20;
}

/* --- --- --- */

export function channelPropertyToColumn(this: ChannelColumn[], property: ChannelProperty): TableColumnInfo {
  const condition = c => c.Name === (property.fromColumn ?? property.name);
  const column = this.find(condition);

  return {
    treePath: property.treePath,
    field: property.name,
    fromColumn: property.fromColumn,
    netType: column?.NetType,
    headerName: property.displayName,
    lookupChannelName: property.lookupChannelName,
  };
}

export function convertRow(channelData: Channel, columns: TableColumnInfo[], row: ChannelRow, index: number) {
  const temp: Record<any, any> = {js_id: index};
  if (!row) return temp;

  for (const column of columns) {
    const name = column.fromColumn ?? column.field;
    let i = channelData.data.columns.findIndex(col => col.Name === name);
    if (i === -1) continue;

    let rowValue = row.Cells[i];
    const field = column.field;

    if (column.netType.endsWith('DateTime') && rowValue) {
      temp[field] = new Date(rowValue);
    } else {
      temp[field] = rowValue;
    }
  }
  return temp;
}

/* --- --- */

export async function apply(editID: number, row, rowAdding: boolean, channel: Channel, dispatch: ThunkDispatch<WState, any, any>) {
  const tableID = channel.tableID;
  const rows = channel.data.rows;
  const columns = channel.data.columns;
  const properties = channel.info.properties;

  /** @type any[] */
  const cells = columns.map((column, index) => {
    let prop = properties.find((property) => {
      const name = property.fromColumn ?? property.name;
      return column.Name === name && (row[property.name] !== null);
    });

    if (!rowAdding) prop = properties.find((property) => {
      const name = property.fromColumn ?? property.name;
      const key = property.name;
      return column.Name === name && rows[editID].Cells[index + 1] !== row[key];
    });

    if (!prop) prop = properties.find((property) => {
      const name = property.fromColumn ?? property.name;
      return column.Name === name && row.hasOwnProperty(property.name)
    });

    let cell;
    if (prop) {
      cell = row[prop.name];
    } else {
      cell = rows[row['js_id']]?.Cells[index];
      if (column.NetType.endsWith('DateTime') && cell) cell = new Date(cell);
    }
    return cell;
  });

  const newRows = [{ID: null, Cells: cells}];
  if (!validateRow(cells, columns)) { return false; }

  const thunk = rowAdding
    ? insertRows(tableID, newRows)
    : updateRows(tableID, [editID], newRows);
  return await dispatch(thunk);
}

function validateRow(cells: any[], columns: ChannelColumn[]): boolean {
  if (cells.length !== columns.length) return false;

  for (let i = 0; i < cells.length; i++) {
    const value = cells[i];
    const isEmptyValue = value === null || value === undefined;
    if (isEmptyValue && columns[i].AllowDBNull === false) return false;
  }
  return true;
}
