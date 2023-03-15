import { IJsonTabNode } from 'flexlayout-react/declarations/model/IJsonModel';


/** Список всех возможных вкладок сверху. */
const allTopTabs: IJsonTabNode[] = [
  { // вкладка "Главная"
    type: 'tab', enableDrag: false,
    id: 'menu', name: 'Главная',
  },
  { // вкладка с программами
    type: 'tab', enableDrag: false,
    id: 'reports', name: 'Программы',
  },
  { // редактор таблицы
    type: 'tab', enableDrag: false,
    id: 'top-dataset', name: 'Таблица',
  },
  { // панель настроек графика
    type: 'tab', enableDrag: false,
    id: 'top-chart', name: 'График',
  },
  { // редактор карты
    type: 'tab', enableDrag: false,
    id: 'top-map', name: 'Карта',
  },
  { // настройки непосредственно каротажа
    type: 'tab', enableDrag: false,
    id: 'top-carat', name: 'Каротаж',
  },
  { // панель настроек трека, относится к каротажу
    type: 'tab', enableDrag: false,
    id: 'top-tracks', name: 'Треки',
  },
];

export function getTopPanelTabs(types?: Set<FormType>): IJsonTabNode[] {
  const tabs: IJsonTabNode[] = [allTopTabs[0], allTopTabs[1]];
  if (!types) return tabs;

  if (types.has('dataSet')) tabs.push(allTopTabs[2]);
  if (types.has('chart')) tabs.push(allTopTabs[3]);
  if (types.has('map')) tabs.push(allTopTabs[4]);
  // if (types.has('carat')) tabs.push(allTopTabs[5], allTopTabs[6]);
  return tabs;
}
