import type {
  IGlobalAttributes, IJsonRowNode,
  IJsonTabSetNode, IJsonTabNode,
} from 'flexlayout-react/declarations/model/IJsonModel';

import { Model } from 'flexlayout-react';
import { MultiMapRecord } from './rows';


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

export function getMultiMapLayout(records: MultiMapRecord[], parent: ClientID): MapTuple {
  const n = records.length;

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
      const id = String(records[i].mapID);
      const childFormID = parent + ',' + id;

      const tab: IJsonTabNode = tabSet.children[0];
      const config: MapItemConfig = {
        id, formID: childFormID, stage: null, loader: null,
        progress: 0, setProgress: () => {},
      };

      tabSet.id = id;
      tab.id = childFormID;
      tab.name = records[i].stratumName;

      childrenList.push(childFormID);
      configList.push(config);
      i++;
    }
  }

  const model = Model.fromJson({global: globalSettings, layout: {type: 'row', children}});
  return [model, childrenList, configList];
}
