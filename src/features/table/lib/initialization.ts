import { TableInit, InitAttachedProperties, DataSetColumnSettings } from './types';
import { getColumnWidth } from './common';
import { createColumnTree, getFlatten } from './column-tree';


/** Модифицирует состояние колонок, после появления информации о типах. */
export function applyColumnTypes(state: TableState, channelColumns: ChannelColumn[]) {
  const properties = state.properties.list;

  channelColumns.forEach(({ Name, NetType, AllowDBNull }, i) => {
    const property = properties.find(p => p.fromColumn === Name);
    if (!property) return;
    const columnState = state.columns[property.name];

    if (columnState.lookupChannel) {
      columnState.type = 'list';
    } else {
      const type = getColumnType(NetType);
      columnState.type = type;
      if (type === 'real') columnState.format = '{0:#.####}';
      else if (type === 'date') columnState.format = '{0:d}';
    }

    columnState.allowNull = AllowDBNull;
    columnState.colIndex = i;
  });
  state.columns = {...state.columns};
  state.properties.typesApplied = true;
}

/** Определяет тип колонки по типу `.NET`. */
function getColumnType(netType: string): TableColumnType {
  if (netType.endsWith('String')) return 'text'; // 'System.String'
  if (netType.includes('Int')) return 'int'; // 'System.Int16', 'System.Int32', ...
  if (netType.endsWith('Decimal') || netType.endsWith('Double')) return 'real';
  if (netType.endsWith('DateTime')) return 'date'; // 'System.DateTime'
  return 'bool';
}

/* --- --- --- */

/** Функция, создающая состояние таблицы по её начальным настройкам. */
export function settingsToState(init: TableInit): TableState {
  const { channelName, properties: allProperties } = init;
  const { columns, attachedProperties } = init.settings;

  const columnsState: TableColumnsState = {};
  const properties = getDisplayedProperties(allProperties, attachedProperties);

  const settingsDict: Record<string, DataSetColumnSettings> = {};
  columns.columnsSettings.forEach((col) => settingsDict[col.channelPropertyName] = col);

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
  const lockedCount = columns.frozenColumnCount ?? 0;
  for (let i = 0; i < lockedCount; i++) columnsState[ids[i]].locked = true;

  const columnsSettings: TableColumnsSettings = {
    lockedCount, isLockingEnabled: lockedCount > 0,
    canUserLockColumns: columns.canUserFreezeColumns,
    alternate: columns.alternate,
    alternateRowBackground: columns.alternateRowBackground,
    isTableMode: columns.isTableMode,
  };

  const columnTree = createColumnTree(properties);
  const columnTreeFlatten = getFlatten(columnTree);

  return {
    editable: false, tableID: null,
    channelName, columnsSettings, columns: columnsState, columnTree, columnTreeFlatten,
    properties: {...attachedProperties, list: properties, typesApplied: false},
    activeCell: {columnID: null, recordID: null, edited: false},
    selection: {}, total: 0, edit: {isNew: false, modified: false},
  };
}

function getColumn(property: ChannelProperty, settings: DataSetColumnSettings): TableColumnState {
  const field = property.name;
  const title = settings?.displayName ?? property.displayName ?? property.name;

  let width = settings?.width, autoWidth = false;
  if (!width || width === 1) { width = getColumnWidth(title); autoWidth = true; }

  const lookupChannel = property.lookupChannelName;
  const linkedTableChannel = property.secondLevelChannelName;
  return {field, title, width, autoWidth, lookupChannel, linkedTableChannel, locked: false};
}

/** Возвращает список свойств, по которому будут строиться колонки. */
function getDisplayedProperties(allProperties: ChannelProperty[], attached: InitAttachedProperties) {
  const option: AttachOptionType = attached.attachOption ?? 'AttachAll';
  const excludeList: string[] = attached.exclude ?? [];

  const checker = option === 'AttachAll'
    ? (property) => !excludeList.includes(property.name)
    : (property) => excludeList.includes(property.name);
  return allProperties.filter(checker);
}
