import { TableFormSettings, InitAttachedProperties, DataSetColumnSettings } from './types';
import { forEachTreeLeaf } from 'shared/lib';


/** Функция, возвращающая исходные настройки по состоянию таблицы. */
export function tableStateToFormSettings (id: FormID, state: TableState): TableFormSettings {
  const { columnsSettings, columns } = state;
  const columnSettings: DataSetColumnSettings[] = [];

  forEachTreeLeaf(state.columnTree, (item, i) => {
    const columnState = columns[item.field];
    columnSettings.push({
      channelPropertyName: item.field,
      displayName: item.title,
      isVisible: item.visible,
      displayIndex: i,
      width: columnState.autoWidth ? 1 : columnState.width,
      isReadOnly: columnState.readOnly,
    } as any);
  });

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
      columnsSettings: columnSettings,
    },
  } as any;
}
