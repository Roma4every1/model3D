import { IJsonTabNode } from 'flexlayout-react/declarations/model/IJsonModel';


/** Список всех возможных вкладок сверху. */
const allTopTabs = {
  'menu': { // вкладка "Главная"
    type: 'tab', enableDrag: false,
    id: 'menu', name: 'Главная',
  },
  'reports': { // вкладка с программами
    type: 'tab', enableDrag: false,
    id: 'reports', name: 'Программы',
  },
  'traces': { // панель настроек трассы, относится к карте
    type: 'tab', enableDrag: false,
    id: 'top-traces', name: 'Трасса',
  },
  'table': { // редактор таблицы
    type: 'tab', enableDrag: false,
    id: 'top-dataset', name: 'Таблица',
  },
  'chart': { // панель настроек графика
    type: 'tab', enableDrag: false,
    id: 'top-chart', name: 'График',
  },
  'map': { // редактор карты
    type: 'tab', enableDrag: false,
    id: 'top-map', name: 'Карта',
  },
  'track': { // панель настроек трека, относится к каротажу
    type: 'tab', enableDrag: false,
    id: 'top-tracks', name: 'Трек',
  },
  'carat': { // настройки непосредственно каротажа
    type: 'tab', enableDrag: false,
    id: 'top-carat', name: 'Каротаж',
  },
};

export function getTopPanelTabs(types?: Set<FormType>, needTracePanel?: boolean): IJsonTabNode[] {
  const tabs: IJsonTabNode[] = [allTopTabs.menu, allTopTabs.reports];
  if (!types) return tabs;

  if (types.has('dataSet')) tabs.push(allTopTabs.table);
  if (types.has('chart')) tabs.push(allTopTabs.chart);
  if (types.has('map')) tabs.push(allTopTabs.map);
  if (types.has('carat')) tabs.push(allTopTabs.track, allTopTabs.carat);
  if (needTracePanel) tabs.push(allTopTabs.traces);
  return tabs;
}
