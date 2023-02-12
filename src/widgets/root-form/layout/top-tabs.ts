import { IJsonTabNode } from 'flexlayout-react/declarations/model/IJsonModel';


/** Список всех возможных вкладок сверху. */
const allTopTabs: IJsonTabNode[] = [
  { // вкладка "Главная"
    type: 'tab', enableDrag: false,
    id: 'top-menu', name: 'Главная', component: 'Menu',
  },
  { // вкладка с программами
    type: 'tab', enableDrag: false,
    id: 'top-programs', name: 'Программы', component: 'SqlPrograms',
  },
  { // редактор таблицы
    type: 'tab', enableDrag: false,
    id: 'top-dataset', name: 'Таблица', component: 'DataSetEditPanel',
  },
  { // панель настроек графика
    type: 'tab', enableDrag: false,
    id: 'top-chart', name: 'График', component: 'ChartEditPanel',
  },
  { // редактор карты
    type: 'tab', enableDrag: false,
    id: 'top-map', name: 'Карта', component: 'MapEditPanel',
  },
  { // панель настроек трека, относится к каротажу
    type: 'tab', enableDrag: false,
    id: 'top-tracks', name: 'Треки', component: 'TracksEditPanel',
  },
  { // настройки непосредственно каротажа
    type: 'tab', enableDrag: false,
    id: 'top-carat', name: 'Каротаж', component: 'CaratEditPanel',
  },
];

export function getTopPanelTabs(proto: FormType[]): IJsonTabNode[] {
  const tabs: IJsonTabNode[] = [allTopTabs[0], allTopTabs[1]];
  if (proto.includes('dataSet')) tabs.push(allTopTabs[2]);
  if (proto.includes('chart')) tabs.push(allTopTabs[3]);
  if (proto.includes('map')) tabs.push(allTopTabs[4]);
  if (proto.includes('carat')) tabs.push(allTopTabs[5], allTopTabs[6]);
  return tabs;
}
