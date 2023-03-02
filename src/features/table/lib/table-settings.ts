import { TableFormSettings, InitAttachedProperties, DataSetColumnSettings } from './types';


/** Функция, возвращающая исходные настройки по состоянию таблицы. */
export function tableStateToFormSettings (id: FormID, state: TableState): TableFormSettings {
  const columns = state.columnTreeFlatten.map(columnID => state.columns[columnID]);
  const columnsSettings = state.columnsSettings;

  const attachedProperties: InitAttachedProperties = {
    attachOption: state.properties.attachOption,
    exclude: state.properties.exclude,
  };

  return {
    id, attachedProperties,
    columns: {
      isTableMode: columnsSettings.isTableMode,
      frozenColumnCount: columnsSettings.lockedCount,
      canUserFreezeColumns: columnsSettings.canUserLockColumns,
      alternate: columnsSettings.alternate,
      alternateRowBackground: columnsSettings.alternateRowBackground,
      columnsSettings: columns.map(columnStateToSettings),
    },
  };
}

function columnStateToSettings(state: TableColumnState, i: number): DataSetColumnSettings {
  return {
    channelPropertyName: state.field,
    displayName: state.title,
    width: state.autoWidth ? 1 : state.width,
    displayIndex: i,
    isVisible: true,
  } as DataSetColumnSettings;
}
