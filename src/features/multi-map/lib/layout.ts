import type { IGlobalAttributes, IJsonRowNode, IJsonTabSetNode, IJsonTabNode } from 'flexlayout-react';
import type { MultiMapChild } from '../store/multi-map.store';
import { Model } from 'flexlayout-react';


const globalSettings: IGlobalAttributes = {
  rootOrientationVertical: true,
  tabEnableRename: false,
  tabEnableDrag: false,
  tabSetEnableDrag: false,
  tabEnableClose: true,
  tabSetTabStripHeight: 26,
  splitterSize: 4,
};

export function getMultiMapLayout(children: MultiMapChild[]): Model {
  const n = children.length;
  let rowsCount = 1;
  while (rowsCount * (rowsCount + 1) < n) { rowsCount++; }

  const rowNodes: IJsonRowNode[] = [];
  for (let i = 0; i < rowsCount; i++) rowNodes.push({type: 'row', children: []});

  let idx = 0, rowIndex = 0;
  while (idx < n) {
    const tabset: IJsonTabSetNode = {type: 'tabset', children: [{type: 'tab'}]};
    rowNodes[rowIndex].children.push(tabset);
    rowIndex = (rowIndex + 1) % rowsCount;
    idx++;
  }

  let i = 0;
  for (const rowNode of rowNodes) {
    for (const tabSet of rowNode.children) {
      const child = children[i++];
      const tab: IJsonTabNode = tabSet.children[0];
      tabSet.id = child.id;
      tab.id = child.formID;
      tab.name = child.stratumName;
    }
  }
  return Model.fromJson({global: globalSettings, layout: {type: 'row', children: rowNodes}});
}
