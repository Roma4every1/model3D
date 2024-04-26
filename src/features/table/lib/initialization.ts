import { TableFormSettings, DataSetColumnSettings, DataSetColumnDict, RowStyleRule } from './types';
import { RecordHandler } from './record-handler';
import { getColumnWidth } from './common';
import { createColumnTree, getFlatten } from './column-tree';


/** Модифицирует состояние колонок, после появления информации о типах. */
export function applyColumnTypes(state: TableState, channelColumns: ChannelColumn[]) {
  channelColumns.forEach(({name, type, nullable }, i) => {
    for (const property of state.properties.filter(p => p.fromColumn === name)) {
      const columnState = state.columns[property.name];

      if (columnState.lookupChannel) {
        if (!columnState.type) columnState.type = 'list';
      } else {
        const tableColumnType = getColumnType(type);
        columnState.type = tableColumnType;
        if (tableColumnType === 'real') columnState.format = '{0:#.####}';
        else if (tableColumnType === 'date') columnState.format = '{0:d}';
      }

      columnState.colName = name;
      columnState.colIndex = i;
      columnState.allowNull = nullable;
    }
  });
  state.columns = {...state.columns};
}

/** Определяет тип колонки по типу `.NET`. */
function getColumnType(netType: ColumnType): TableColumnType {
  if (netType.includes('Int')) return 'int'; // 'System.Int16', 'System.Int32', ...
  if (netType.includes('Bool')) return 'bool';

  if (netType.endsWith('Decimal') || netType.endsWith('Double') || netType.endsWith('Single')) {
    return 'real';
  }
  if (netType.endsWith('DateTime')) return 'date'; // 'System.DateTime'
  return 'text';
}

/* --- --- --- */

/** Функция, создающая состояние таблицы по её начальным настройкам. */
export function settingsToTableState(payload: FormStatePayload<TableFormSettings>): TableState {
  const settings = payload.settings;
  const attachedChannel = payload.state.channels[0];
  const channel = payload.channels[attachedChannel?.name];

  const allProperties = channel?.config.properties ?? [];
  if (channel && channel.query.limit === undefined) channel.query.limit = 100;

  let { columnSettings: columns, toolbar } = settings;
  const properties = attachedChannel?.attachedProperties ?? [];

  const columnsState: TableColumnsState = {};
  const settingsDict: DataSetColumnDict = {};
  columns?.columns.forEach((col) => settingsDict[col.property] = col);

  properties.sort((a, b) => {
    const aIndex = settingsDict[a.name]?.displayIndex ?? 1000;
    const bIndex = settingsDict[b.name]?.displayIndex ?? 1000;
    return aIndex - bIndex;
  });
  properties.forEach((property) => {
    const columnID = property.name;
    columnsState[columnID] = getColumn(property, settingsDict[columnID]);
  });

  const ids = properties.map(p => p.name);
  const lockedCount = columns?.fixedColumnCount ?? 0;
  for (let i = 0; i < lockedCount; i++) columnsState[ids[i]].locked = true;

  const columnsSettings: TableColumnsSettings = {
    lockedCount, isLockingEnabled: lockedCount > 0,
    canUserLockColumns: true,
    alternate: columns?.alternate ?? true,
    alternateBackground: columns?.alternateBackground ?? 'none',
    tableMode: columns?.tableMode ?? true,
  };

  const columnTree = createColumnTree(properties, settingsDict);
  const columnTreeFlatten = getFlatten(columnTree);

  let activeRecordParameter: ActiveRecordParameter = null;
  const activeRowParameter = channel?.config.activeRowParameter;

  if (activeRowParameter) {
    for (const clientID in payload.parameters) {
      const paramList = payload.parameters[clientID];
      const parameter = paramList.find(p => p.id === activeRowParameter);

      if (parameter) {
        if (parameter.type === 'tableRow') {
          activeRecordParameter = {id: activeRowParameter, clientID};
        }
        break;
      }
    }
  }

  const rowStyleSelector = columns?.rowStyleRules;
  let rowStyleRules: RowStyleRule[] | null = null;

  if (rowStyleSelector?.length > 0) {
    rowStyleRules = [];
    for (const rule of rowStyleSelector) {
      const propertyName = rule.property;
      if (!propertyName) continue;
      const property = allProperties.find(p => p.name === propertyName);
      if (!property) continue;

      if (!properties.includes(property)) {
        properties.push(property);
        columnsState[propertyName] = getColumn(property, null);
      }
      rowStyleRules.push(rule);
    }
  }

  return {
    recordHandler: new RecordHandler(columnsState, rowStyleRules),
    queryID: null, editable: false, activeRecordParameter,
    headerSetterRules: settings.headerSetterRules ?? [],
    channelName: attachedChannel?.name,
    toolbarSettings: toolbar,
    columnsSettings, columns: columnsState, columnTree, columnTreeFlatten,
    properties: properties,
    activeCell: {columnID: null, recordID: null, edited: false},
    selection: {}, total: 0, edit: {isNew: false, modified: false},
  };
}

function getColumn(property: ChannelProperty, settings: DataSetColumnSettings): TableColumnState {
  const title = settings?.displayName ?? property.displayName ?? property.name;
  let width = settings?.width, autoWidth = false;
  if (!width || width === 1) { width = getColumnWidth(title); autoWidth = true; }

  return {
    field: property.name, colIndex: -1,
    title, width, autoWidth,
    lookupChannel: property.lookupChannels[0],
    detailChannel: property.detailChannel,
    readOnly: settings?.readOnly === true, locked: false,
  };
}
