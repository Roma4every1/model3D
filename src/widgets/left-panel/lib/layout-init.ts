import { Model, IJsonModel } from 'flexlayout-react';
import { IJsonTabNode, IJsonTabSetNode } from 'flexlayout-react/declarations/model/IJsonModel';
import { leftPanelGlobalAttributes, leftRootID, minTabSetHeight } from './constants';
import { globalParamsName, presentationParamsName, presentationTreeName } from './constants';
import { globalParamsTabID, presentationParamsTabID, presentationTreeTabID } from './constants';


/** Создаёт модель разметки левой панели. */
export function createLeftLayout(proto: IJsonModel): LeftPanelLayout {
  const ok = proto.layout?.children?.length;
  return ok ? createLayout(proto) : createDefaultLayout();
}

function createLayout(model: IJsonModel): LeftPanelLayout {
  const proto: Omit<LeftPanelLayout, 'model'> = {
    global: {displayName: globalParamsName, show: false},
    presentation: {displayName: presentationParamsName, show: false},
    tree: {displayName: presentationTreeName, show: false},
  };

  model.layout.id = leftRootID;
  correctNode(model.layout, proto);
  const vertical = model.global.rootOrientationVertical;

  const finalLayout: IJsonModel = {
    global: {...leftPanelGlobalAttributes, rootOrientationVertical: vertical},
    layout: model.layout,
  };
  return {...proto, model: Model.fromJson(finalLayout)};
}

function correctNode(node: any, proto: Omit<LeftPanelLayout, 'model'>) {
  if (node.type === 'tabset') {
    node.selected = 0;
    node.minHeight = minTabSetHeight;
    node.children = getTabs(proto, node?.children ?? []);
  }
  if (node.type === 'row') {
    node.children = node?.children.filter(tabSet => tabSet?.children.length && tabSet.selected !== -1);
    node?.children.forEach((node) => correctNode(node, proto));
  }
}

function getTabs(proto: Omit<LeftPanelLayout, 'model'>, items: any[]): IJsonTabNode[] {
  const tabNodes: IJsonTabNode[] = [];

  for (const item of items) {
    const tabID: string = item?.id;
    if (!tabID) continue;

    if (!proto.global.show && tabID.endsWith(globalParamsTabID)) {
      const name = item.title ?? globalParamsName;
      tabNodes.push({type: 'tab', id: globalParamsTabID, name});
      proto.global.show = true;
    }
    else if (!proto.presentation.show && tabID.endsWith(presentationParamsTabID)) {
      const name = item.title ?? presentationParamsName;
      tabNodes.push({type: 'tab', id: presentationParamsTabID, name});
      proto.presentation.show = true;
    }
    else if (!proto.tree.show && tabID.endsWith(presentationTreeTabID)) {
      const name = item.title ?? presentationTreeName;
      tabNodes.push({type: 'tab', id: presentationTreeTabID, name});
      proto.tree.show = true;
    }
  }
  return tabNodes;
}

/* --- --- */

function createDefaultLayout(): LeftPanelLayout {
  const children: IJsonTabSetNode[] = [
    {
      id: 'global', type: 'tabset', weight: 50, minHeight: minTabSetHeight,
      children: [
        {type: 'tab', id: globalParamsTabID, name: globalParamsName},
      ],
    },
    {
      id: 'tree', type: 'tabset', weight: 50, minHeight: minTabSetHeight,
      children: [
        {type: 'tab', id: presentationTreeTabID, name: presentationTreeName},
      ],
    },
  ];

  const layout: IJsonModel = {
    global: leftPanelGlobalAttributes,
    layout: {id: leftRootID, type: 'row', children},
  };
  return {
    model: Model.fromJson(layout),
    global: {displayName: globalParamsName, show: true},
    presentation: {displayName: presentationParamsName, show: false},
    tree: {displayName: presentationTreeName, show: true},
  };
}
