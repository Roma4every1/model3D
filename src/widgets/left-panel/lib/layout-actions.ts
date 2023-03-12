import { Model, Actions, DockLocation } from 'flexlayout-react';
import { leftTabIDDict, leftRootID } from './constants';


/** Вернёт видимость вкладки в левой панели. */
export function showLeftTab(layout: LeftPanelLayout, type: LeftTabType) {
  const tabInfo = layout[type];
  const tab = {type: 'tab', id: leftTabIDDict[type], name: tabInfo.displayName};

  const model: Model = layout.model;
  const tabSet = tabInfo.parent ? model.getNodeById(tabInfo.parent) : null;

  const action = tabSet
    ? Actions.addNode(tab, tabInfo.parent, DockLocation.CENTER, tabInfo.index, false)
    : Actions.addNode(tab, leftRootID, DockLocation.BOTTOM, 0, false);

  model.doAction(action);
  tabInfo.show = true;
}

/** Скроет видимость вкладки в левой панели. */
export function hideLeftTab(layout: LeftPanelLayout, type: LeftTabType) {
  const id = leftTabIDDict[type];
  const model: Model = layout.model;
  const parent = model.getNodeById(id)?.getParent();
  const children = parent?.getChildren();

  layout[type].show = false;
  layout[type].parent = parent?.getId();
  layout[type].index = children ? children.findIndex(item => item.getId() === id) : -1;
  model.doAction(Actions.deleteTab(id));
}
