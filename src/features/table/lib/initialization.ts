import type { TableFormSettings, DataSetColumnSettings, DataSetColumnDict, RowStyleRule } from './types';
import { RecordHandler } from './record-handler';
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
  const settings = payload.state.settings;
  const attachedChannel = payload.state.channels[0];
  const channel = payload.channels[attachedChannel?.id];

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
  const recordHandler = new RecordHandler(columnsState, rowStyleRules);
  recordHandler.checkAutoWidthColumns();

  return {
    recordHandler, queryID: null, editable: false,
    activeRecordParameter: channel?.config.activeRowParameter,
    headerSetterRules: getHeaderSetterRules(settings.headerSetterRules, payload),
    channelID: attachedChannel?.id,
    lookupChannelIDs: findLookups(channel?.config.properties),
    toolbarSettings: toolbar,
    columnsSettings, columns: columnsState, columnTree, columnTreeFlatten,
    properties: properties,
    activeCell: {columnID: null, recordID: null, edited: false},
    selection: {}, total: 0, edit: {isNew: false, modified: false},
  };
}

function getColumn(property: ChannelProperty, settings: DataSetColumnSettings): TableColumnState {
  return {
    field: property.name, colIndex: -1,
    title: settings?.displayName ?? property.displayName ?? property.name,
    width: settings?.width, autoWidth: false,
    lookupChannel: property.lookupChannels[0],
    detailChannel: property.detailChannel,
    readOnly: settings?.readOnly === true, locked: false,
  };
}

function getHeaderSetterRules(rules: HeaderSetterRule[], payload: FormStatePayload): HeaderSetterRule[] {
  const result: HeaderSetterRule[] = [];
  if (!rules) return result;

  const parent = payload.state.parent;
  const clients: ParameterDict = payload.parameters;

  for (const rule of rules) {
    const cb = (p: Parameter): boolean => p.name === rule.parameter;
    const id = (clients[parent].find(cb) ?? clients.root.find(cb))?.id;
    if (id) { rule.id = id; result.push(rule); }
  }
  return result;
}

/** Находит все каналы справочники по набору свойств. */
function findLookups(properties: ChannelProperty[]): ChannelID[] {
  if (!properties) return [];
  const result: Set<ChannelID> = new Set();

  for (const property of properties) {
    for (const id of property.lookupChannels) result.add(id);
  }
  return [...result];
}
