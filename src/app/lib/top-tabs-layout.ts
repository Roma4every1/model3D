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
];

export function getTopPanelTabs(types?: Set<FormType>): IJsonTabNode[] {
  const tabs: IJsonTabNode[] = [allTopTabs[0], allTopTabs[1]];
  if (!types) return tabs;

  if (types.has('dataSet')) tabs.push(allTopTabs[2]);
  if (types.has('chart')) tabs.push(allTopTabs[3]);
  if (types.has('map')) tabs.push(allTopTabs[4]);
  return tabs;
}
