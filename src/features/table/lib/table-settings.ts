import type { TableFormSettings, DataSetColumnSettings } from './types';
import { forEachTreeLeaf } from 'shared/lib';


/** Функция, возвращающая исходные настройки по состоянию таблицы. */
export function tableStateToSettings (id: FormID, state: TableState): TableFormSettings {
  const { columnsSettings, columns, headerSetterRules, toolbarSettings } = state;
  const columnSettings: DataSetColumnSettings[] = [];

  forEachTreeLeaf(state.columnTree, (item, i) => {
    const columnState = columns[item.field];
    columnSettings.push({
      property: item.field,
      displayName: item.title,
      visible: item.visible,
      displayIndex: i,
      width: columnState.autoWidth ? 1 : columnState.width,
      readOnly: columnState.readOnly,
    });
  });

  return {
    id, toolbar: toolbarSettings,
    columnSettings: {
      tableMode: columnsSettings.tableMode,
      fixedColumnCount: columnsSettings.lockedCount,
      alternate: columnsSettings.alternate,
      alternateBackground: columnsSettings.alternateBackground,
      columns: columnSettings,
    },
    headerSetterRules: headerSetterRules,
  };
}
