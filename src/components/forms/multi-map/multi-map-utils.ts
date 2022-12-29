import { IJsonModel, Model } from "flexlayout-react";
import { IGlobalAttributes, IJsonRowNode } from "flexlayout-react/declarations/model/IJsonModel";
import { IJsonTabSetNode, IJsonTabNode } from "flexlayout-react/declarations/model/IJsonModel";


export interface MapItemConfig {
  id: MapID,
  data: any,
  formID: FormID,
  progress: number,
  setProgress?: Function,
}
type MapChannelCell = [number, string, string, string];
export type MapTuple = [Model, ActiveChildrenList, MapItemConfig[]];


const globalSettings: IGlobalAttributes = {
  rootOrientationVertical: true,
  tabEnableRename: false,
  tabEnableDrag: false,
  tabEnableClose: false,
  tabSetTabStripHeight: 28,
  splitterSize: 4,
};

export const getMultiMapLayout = (rows: MapChannelCell[], formID: FormID): MapTuple => {
  const n = rows.length;

  let rowsCount = 1;
  while(rowsCount * (rowsCount + 1) < n) { rowsCount++; }

  const children: IJsonRowNode[] = [];
  for (let i = 0; i < rowsCount; i++) children.push({type: 'row', children: []});

  let idx = 0, rowIndex = 0;
  while (idx < n) {
    const tabset: IJsonTabSetNode = {type: 'tabset', children: [{type: 'tab'}]};
    children[rowIndex].children.push(tabset);
    rowIndex = (rowIndex + 1) % rowsCount;
    idx++;
  }

  let i = 0;
  const childrenList = [];
  const configList = [];

  for (const row of children) {
    for (const tab of row.children) {
      const id = rows[i][0].toString();
      const childFormID = formID + ',' + id;
      tab.id = childFormID;

      const child: IJsonTabNode = tab.children[0];
      const config: MapItemConfig = {
        id, data: {}, formID: childFormID,
        progress: 0, setProgress: () => {},
      };

      child.id = id;
      child.name = rows[i][3];
      child.config = config;

      childrenList.push(childFormID);
      configList.push(config);
      i++;
    }
  }
  const layout: IJsonModel = {global: globalSettings, layout: {type: 'row', children}};
  return [Model.fromJson(layout), childrenList, configList];
};
