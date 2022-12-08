import { IJsonTabNode } from "flexlayout-react/declarations/model/IJsonModel";


const allRightTabs: IJsonTabNode[] = [
  { // генератор отчётов
    type: 'tab', enableDrag: false,
    id: 'right-dock', name: 'Отчёты', component: 'DownloadFiles',
  },
  { // вкладка со слоями карты
    type: 'tab', enableDrag: false,
    id: 'right-map', name: 'Слои карты', component: 'LayersTree',
  },
];

export function getRightPanelTabs(proto: FormType[]): IJsonTabNode[] {
  const tabs: IJsonTabNode[] = [allRightTabs[0]];
  if (proto.includes('map')) tabs.push(allRightTabs[1]);
  return tabs;
}
