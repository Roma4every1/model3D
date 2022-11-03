type FormTypeWithPlugin = 'Dock' | 'Grid' | 'DataSet' | 'Map' | 'Chart';
export type FormPluginsSettings = Record<string, FormPluginSettings>;

export interface FormPluginSettings {
  type: 'top' | 'strip' | 'right' | 'inner',
  component: string,
  label: string,
}


export const pluginsSettings: Record<FormTypeWithPlugin, FormPluginsSettings> = {
  Dock: {
    menu: {
      type: 'top',
      component: 'Menu',
      label: 'Меню',
    },
    downloadFiles: {
      type: 'right',
      component: 'DownloadFiles',
      label: 'Отчёты',
    },
    dateChanging: {
      type: 'inner',
      component: 'DateChanging',
      label: 'Установщик интервала дат по году',
    },
  },
  Grid: {
    sqlPrograms: {
      type: 'top',
      component: 'SqlPrograms/SqlProgramsList',
      label: 'Программы',
    },
  },
  DataSet: {
    exportToExcel: {
      type: 'strip',
      component: 'ExportToExcel',
      label: 'Экспорт в Excel',
    },
    selectAllRec: {
      type: 'strip',
      component: 'SelectAllRec',
      label: 'Выделить все',
    },
    statistics: {
      type: 'strip',
      component: 'Statistics',
      label: 'Статистика',
    },
    columnSettings: {
      type: 'strip',
      component: 'ColumnSettings',
      label: 'Настройки колонок',
    },
    columnsVisibility: {
      type: 'strip',
      component: 'ColumnsVisibility',
      label: 'Видимость колонок',
    },
    columnHeaderSetter: {
      type: 'inner',
      component: 'ColumnHeaderSetter',
      label: 'Установщик заголовков колонок',
    },
    columnSettingsAnalyzer: {
      type: 'inner',
      component: 'ColumnSettingsAnalyzer',
      label: 'Обработчик настроек колонок',
    },
  },
  Map: {
    editing: {
      type: 'strip',
      component: 'MapEditPanel',
      label: 'Редактирование карты',
    },
    sublayersTree: {
      type: 'right',
      component: 'LayersTree',
      label: 'Слои карты',
    },
  },
  Chart: {
    seriesSettings: {
      type: 'strip',
      component: 'SeriesSettings',
      label: 'Настройки графика',
    },
  },
};
