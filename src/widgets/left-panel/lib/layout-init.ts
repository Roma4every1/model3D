import type { IJsonModel, IJsonTabSetNode, IJsonTabNode } from 'flexlayout-react/declarations/model/IJsonModel';
import { Actions, Model } from 'flexlayout-react';
import { leftRootID, leftPanelGlobalAttributes, minTabSetHeight, leftTabInfo } from './constants';


/** Создаёт модель разметки левой панели. */
export function createLeftLayout(dto: IJsonModel): LeftPanelLayout {
  const { id1: gTabID, name: gName } = leftTabInfo.globalParameters;
  const { id: pTabID, name: pName } = leftTabInfo.presentationParameters;
  const { id: tTabID, name: tName } = leftTabInfo.presentationTree;

  const layout: LeftPanelLayout = {
    model: null,
    globalParameters: {id: gTabID, displayName: gName, show: false},
    presentationParameters: {id: pTabID, displayName: pName, show: false},
    presentationTree: {id: tTabID, displayName: tName, show: false},
  };

  if (dto.layout?.children?.length) {
    applyModel(layout, dto);
  } else {
    applyDefaultModel(layout);
  }
  return layout;
}

function applyModel(proto: LeftPanelLayout, json: IJsonModel): void {
  const vertical = json.global.rootOrientationVertical;
  json.layout.id = leftRootID;
  correctNode(json.layout, proto);

  const model = Model.fromJson({
    global: {...leftPanelGlobalAttributes, rootOrientationVertical: vertical},
    layout: json.layout,
  });

  const { id1, id2 } = leftTabInfo.globalParameters;
  const gTab1 = model.getNodeById(id1);
  const gTab2 = model.getNodeById(id2);

  if (gTab1 && gTab2) model.doAction(Actions.deleteTab(id1));
  proto.model = model;
}

function correctNode(node: any, proto: LeftPanelLayout): void {
  if (node.type === 'tabset') {
    node.selected = 0;
    node.minHeight = minTabSetHeight;
    node.children = node.children ? getTabs(proto, node.children) : [];
  }
  if (node.type === 'row') {
    node.children = node?.children.filter(tabSet => tabSet?.children.length && tabSet.selected !== -1);
    node?.children.forEach((node) => correctNode(node, proto));
  }
}

function getTabs(proto: LeftPanelLayout, items: any[]): IJsonTabNode[] {
  const tabNodes: IJsonTabNode[] = [];
  const { globalParameters, presentationParameters, presentationTree } = proto;

  const { id1: gID1, id2: gID2, name: gName } = leftTabInfo.globalParameters;
  const { id: pID, name: pName } = leftTabInfo.presentationParameters;
  const { id: tID, name: tName } = leftTabInfo.presentationTree;

  for (const item of items) {
    const tabID: string = item?.id;
    if (!tabID) continue;

    if (tabID === gID1 || tabID === gID2) {
      const name = item.title ?? gName;
      tabNodes.push({type: 'tab', id: tabID, name, component: 'globalParameters'});
      globalParameters.id = tabID;
      globalParameters.show = true;
    }
    else if (!presentationParameters.show && tabID === pID) {
      const name = item.title ?? pName;
      tabNodes.push({type: 'tab', id: tabID, name, component: 'presentationParameters'});
      presentationParameters.id = tabID;
      presentationParameters.show = true;
    }
    else if (!presentationTree.show && tabID === tID) {
      const name = item.title ?? tName;
      tabNodes.push({type: 'tab', id: tabID, name, component: 'presentationTree'});
      presentationTree.id = tabID;
      presentationTree.show = true;
    }
  }
  return tabNodes;
}

/* --- --- */

function applyDefaultModel(proto: LeftPanelLayout): void {
  const gParentID = 'g-tabset', pParentID = 'p-tabset';
  const { globalParameters: g, presentationTree: p } = proto;

  const children: IJsonTabSetNode[] = [
    {
      id: gParentID, type: 'tabset', weight: 1, minHeight: minTabSetHeight,
      children: [{type: 'tab', id: g.id, name: g.displayName, component: 'globalParameters'}],
    },
    {
      id: pParentID, type: 'tabset', weight: 1, minHeight: minTabSetHeight,
      children: [{type: 'tab', id: p.id, name: p.displayName, component: 'presentationTree'}],
    },
  ];
  const layout: IJsonModel = {
    global: leftPanelGlobalAttributes,
    layout: {id: leftRootID, type: 'row', children},
  };

  g.parent = gParentID; g.index = 0; g.show = true;
  p.parent = pParentID; p.index = 0; p.show = true;
  proto.model = Model.fromJson(layout);
}
