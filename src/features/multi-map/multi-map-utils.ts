import { IJsonModel, Model } from 'flexlayout-react';
import { IGlobalAttributes, IJsonRowNode } from 'flexlayout-react/declarations/model/IJsonModel';
import { IJsonTabSetNode, IJsonTabNode } from 'flexlayout-react/declarations/model/IJsonModel';


export type MapTuple = [Model, FormID[], MapItemConfig[]];


const globalSettings: IGlobalAttributes = {
  rootOrientationVertical: true,
  tabEnableRename: false,
  tabEnableDrag: false,
  tabSetEnableDrag: false,
  tabEnableClose: false,
  tabSetTabStripHeight: 26,
  splitterSize: 4,
};

export const getMultiMapLayout = (rows: ChannelRow[], formID: FormID): MapTuple => {
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
    for (const tabSet of row.children) {
      const id = rows[i].Cells[0].toString();
      const childFormID = formID + ',' + id;

      const tab: IJsonTabNode = tabSet.children[0];
      const config: MapItemConfig = {
        id, data: {}, formID: childFormID,
        progress: 0, setProgress: () => {},
      };

      tabSet.id = id;
      tab.id = childFormID;
      tab.name = rows[i].Cells[3];

      childrenList.push(childFormID);
      configList.push(config);
      i++;
    }
  }
  const layout: IJsonModel = {global: globalSettings, layout: {type: 'row', children}};
  return [Model.fromJson(layout), childrenList, configList];
};
