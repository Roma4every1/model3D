import { IJsonTabNode } from 'flexlayout-react/declarations/model/IJsonModel';


const allRightTabs: IJsonTabNode[] = [
  { // генератор отчётов
    type: 'tab', enableDrag: false,
    id: 'right-dock', name: 'Отчёты',
  },
  { // редактирование трасс
    type: 'tab', enableDrag: false,
    id: 'right-trace', name: 'Редактирование трассы',
  },
  { // вкладка со слоями карты
    type: 'tab', enableDrag: false,
    id: 'right-map', name: 'Слои карты',
  },
];

export function getRightPanelTabs(types: Set<FormType> | undefined, needTracePanel: boolean) {
  const tabs: IJsonTabNode[] = [allRightTabs[0]];
  if (needTracePanel) tabs.push(allRightTabs[1]);
  if (types && types.has('map')) tabs.push(allRightTabs[2]);
  return tabs;
}
