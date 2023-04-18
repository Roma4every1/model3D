import { Model, IJsonModel } from 'flexlayout-react';
import { IGlobalAttributes, IJsonTabSetNode } from 'flexlayout-react/declarations/model/IJsonModel';
import { getTopPanelTabs } from './top-tabs-layout';
import { getRightPanelTabs } from './right-tabs-layout';


const globalAttributes: IGlobalAttributes = {
  tabSetEnableTabStrip: false,
  borderEnableDrop: false,
  tabEnableRename: false,
  tabEnableClose: false,
  tabEnableDrag: false,
  tabSetEnableDrag: false,
  splitterSize: 8,
};
const formTabset: IJsonTabSetNode = {
  type: 'tabset', minWidth: 200,
  children: [{type: 'tab', component: 'form'}],
};

export function getDockLayout(
  formTypes: Set<FormType> | undefined, dockLayout: CommonLayout,
  needTracePanel: boolean, isTraceEditing: boolean
): Model {
  const topTabs = getTopPanelTabs(formTypes, needTracePanel);
  const rightTabs = getRightPanelTabs(formTypes, isTraceEditing);

  const selectedTop = dockLayout.selectedTopTab < topTabs.length ? dockLayout.selectedTopTab : -1;

  let selectedRight;
  if (isTraceEditing)
    selectedRight = 1;
  else
    selectedRight = dockLayout.selectedRightTab < rightTabs.length ? dockLayout.selectedRightTab : -1;

  const layout: IJsonModel = {
    global: globalAttributes,
    borders: [
      {
        type: 'border', location: 'top',
        barSize: 26, size: dockLayout.topPanelHeight, minSize: 80, selected: selectedTop,
        children: topTabs,
      },
      {
        type: 'border', location: 'right',
        barSize: 26, size: dockLayout.rightPanelWidth, minSize: 150, selected: selectedRight,
        children: rightTabs,
      },
    ],
    layout: {
      type: 'row',
      children: [
        {
          type: 'tabset', width: dockLayout.leftPanelWidth, minWidth: 150,
          children: [{id: 'left', type: 'tab', component: 'left'}],
        },
        formTabset,
      ],
    },
  };
  return Model.fromJson(layout);
}
