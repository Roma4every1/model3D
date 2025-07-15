import type { IGlobalAttributes, IJsonTabNode } from 'flexlayout-react';


/** Глобальные настойки разметки приложения. */
export const appLayoutAttrs: IGlobalAttributes = {
  splitterSize: 6,
  tabEnableDrag: false,
  tabEnableClose: false,
  tabEnableFloat: false,
  tabEnableRename: false,
  tabSetEnableDrag: false,
  tabSetEnableTabStrip: false,
  borderBarSize: 26,
  borderClassName: 'no-user-select',
  borderEnableDrop: false,
};

/** Глобальные настройки левой панели. */
export const leftLayoutAttrs: IGlobalAttributes = {
  splitterSize: 6,
  tabEnableClose: false,
  tabEnableFloat: false,
  tabEnableRename: false,
  tabSetMinHeight: 75,
  tabSetTabStripHeight: 26,
  rootOrientationVertical: true,
};

/** Значения по умолчанию для вкладок левой панели. */
export const leftTabInfo = {
  globalParameters: {
    id1: 'dockGlobalParameterListSidePanel',
    id2: 'dockTreeSidePanel',
    name: 'Параметры',
  },
  presentationParameters: {
    id: 'gridPresentationParameterListSidePanel',
    name: 'Параметры презентации',
  },
  presentationTree: {
    id: 'dockPresentationsManagerSidePanel',
    name: 'Презентации',
  },
};

/** Список всех возможных вкладок сверху. */
export const topTabDict: Record<string, IJsonTabNode> = {
  'menu': { // вкладка "Главная"
    type: 'tab', enableDrag: false,
    id: 'menu', name: 'Главная',
  },
  'top-table': { // настройки таблицы
    type: 'tab', enableDrag: false,
    id: 'top-table', name: 'Таблица',
  },
  'top-chart': { // настройки графика
    type: 'tab', enableDrag: false,
    id: 'top-chart', name: 'График',
  },
  'top-map': { // настройки карты
    type: 'tab', enableDrag: false,
    id: 'top-map', name: 'Карта',
  },
  'top-track': { // настройки трека (каротажная фрома)
    type: 'tab', enableDrag: false,
    id: 'top-track', name: 'Трек',
  },
  'top-carat': { // настройки каротажных кривых
    type: 'tab', enableDrag: false,
    id: 'top-carat', name: 'Каротаж',
  },
  'top-profile': { // настройки профиля
    type: 'tab', enableDrag: false,
    id: 'top-profile', name: 'Профиль',
  },
  'top-trace': { // настройки и управление трассами
    type: 'tab', enableDrag: false,
    id: 'top-trace', name: 'Трасса',
  },
  'top-selection': { // настройки и управление выборками
    type: 'tab', enableDrag: false,
    id: 'top-selection', name: 'Выборка',
  },
  'top-site': { // настройки и управление участками
    type: 'tab', enableDrag: false,
    id: 'top-site', name: 'Участок',
  },
};

/** Список всех возможных вкладок справа. */
export const rightTabDict: Record<string, IJsonTabNode> = {
  'right-dock': { // активные отчёты
    type: 'tab', enableDrag: false,
    id: 'right-dock', name: 'Отчёты',
  },
  'right-map': { // дерево слоёв карты
    type: 'tab', enableDrag: false,
    id: 'right-map', name: 'Слои карты',
  },
  'right-trace': { // редактор элементов трассы
    type: 'tab', enableDrag: false,
    id: 'right-trace', name: 'Редактирование трассы',
  },
  'right-profile': { // вспомогательная панель профиля
    type: 'tab', enableDrag: false,
    id: 'right-profile', name: 'Параметры профиля',
  },
  'right-model': {
    type: 'tab', enableDrag: false,
    id: 'right-model', name: 'Слои модели',
  }
};
