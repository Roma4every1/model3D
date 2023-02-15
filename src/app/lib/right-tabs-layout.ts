import { IJsonTabNode } from 'flexlayout-react/declarations/model/IJsonModel';


const allRightTabs: IJsonTabNode[] = [
  { // генератор отчётов
    type: 'tab', enableDrag: false,
    id: 'right-dock', name: 'Отчёты',
  },
  { // вкладка со слоями карты
    type: 'tab', enableDrag: false,
    id: 'right-map', name: 'Слои карты',
  },
];

export function getRightPanelTabs(types?: Set<FormType>): IJsonTabNode[] {
  const tabs: IJsonTabNode[] = [allRightTabs[0]];
  if (types && types.has('map')) tabs.push(allRightTabs[1]);
  return tabs;
}
