import { InitAttachedProperties, TableFormSettings } from './types';
import { DataSetColumnSettings, DataSetColumnDict } from './types';
import { getColumnWidth } from './common';
import { createColumnTree, getFlatten } from './column-tree';


/** Модифицирует состояние колонок, после появления информации о типах. */
export function applyColumnTypes(state: TableState, channelColumns: ChannelColumn[]) {
  const propertyList = state.properties.list;

  channelColumns.forEach(({ Name, NetType, AllowDBNull }, i) => {
    for (const property of propertyList.filter(p => p.fromColumn === Name)) {
      const columnState = state.columns[property.name];

      if (columnState.lookupChannel) {
        if (!columnState.type) columnState.type = 'list';
      } else {
        const type = getColumnType(NetType);
        columnState.type = type;
        if (type === 'real') columnState.format = '{0:#.####}';
        else if (type === 'date') columnState.format = '{0:d}';
      }

      columnState.colName = Name;
      columnState.colIndex = i;
      columnState.allowNull = AllowDBNull;
    }
  });
  state.columns = {...state.columns};
  state.properties.typesApplied = true;
}

/** Определяет тип колонки по типу `.NET`. */
function getColumnType(netType: string): TableColumnType {
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
export function settingsToTableState(payload: FormStatePayload): TableState {
  const settings: TableFormSettings = payload.settings;
  const channelName = payload.state.channels[0];
  const channel = payload.channels[channelName];

  const allProperties = channel?.info.properties ?? [];
  if (channel) channel.query.maxRowCount = 100;

  let { columns, attachedProperties } = settings;
  if (!attachedProperties) attachedProperties = {attachOption: 'AttachNothing', exclude: []};
  const properties = getDisplayedProperties(allProperties, attachedProperties);

  if (columns?.columnsSettings.filter((col) => col.isVisible).length === 0) {
    columns.columnsSettings.forEach((col) => { col.isVisible = true; })
  } // временная заглушка

  const columnsState: TableColumnsState = {};
  const settingsDict: DataSetColumnDict = {};
  columns?.columnsSettings.forEach((col) => settingsDict[col.channelPropertyName] = col);

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
  const lockedCount = columns?.frozenColumnCount ?? 0;
  for (let i = 0; i < lockedCount; i++) columnsState[ids[i]].locked = true;

  const columnsSettings: TableColumnsSettings = {
    lockedCount, isLockingEnabled: lockedCount > 0,
    canUserLockColumns: columns?.canUserFreezeColumns ?? true,
    alternate: columns?.alternate ?? true,
    alternateRowBackground: columns?.alternateRowBackground ?? 'none',
    isTableMode: columns?.isTableMode ?? true,
  };

  const columnTree = createColumnTree(properties, settingsDict);
  const columnTreeFlatten = getFlatten(columnTree);

  let activeRecordParameter: ActiveRecordParameter = null;
  const currentRowObjectName = channel?.info.currentRowObjectName;

  if (currentRowObjectName) {
    for (const clientID in payload.parameters) {
      const paramList = payload.parameters[clientID];
      const parameter = paramList.find(p => p.id === currentRowObjectName);

      if (parameter) {
        if (parameter.type === 'tableRow') {
          activeRecordParameter = {id: currentRowObjectName, clientID};
        }
        break;
      }
    }
  }

  return {
    tableID: null, editable: false, activeRecordParameter,
    headerSetterRules: settings.headerSetterRules ?? [],
    channelName, columnsSettings, columns: columnsState, columnTree, columnTreeFlatten,
    properties: {...attachedProperties, list: properties, typesApplied: false},
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
    linkedTableChannel: property.secondLevelChannelName,
    readOnly: settings?.isReadOnly === true, locked: false,
  };
}

/** Возвращает список свойств, по которому будут строиться колонки. */
function getDisplayedProperties(allProperties: ChannelProperty[], attached: InitAttachedProperties) {
  const option: AttachOptionType = attached?.attachOption ?? 'AttachNothing';
  const excludeList: string[] = attached?.exclude ?? [];

  const checker = option === 'AttachAll'
    ? (property) => !excludeList.includes(property.name)
    : (property) => excludeList.includes(property.name);
  return allProperties.filter(checker);
}
