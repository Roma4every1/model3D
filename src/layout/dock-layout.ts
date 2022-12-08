import { IJsonModel } from "flexlayout-react";
import { IGlobalAttributes, IJsonTabSetNode } from "flexlayout-react/declarations/model/IJsonModel";
import { getTopPanelTabs } from "./top-tabs";
import { getRightPanelTabs } from "./right-tabs";


const globalAttributes: IGlobalAttributes = {
  tabSetEnableTabStrip: false,
  borderEnableDrop: false,
  tabEnableClose: false,
  splitterSize: 6,
};
const formTabset: IJsonTabSetNode = {
  type: 'tabset', minWidth: 200,
  children: [{type: 'tab', component: 'form'}],
};

export function getDockLayout(displayedFormTypes: FormType[], dockLayout: DockLayout): IJsonModel {
  const topTabs = getTopPanelTabs(displayedFormTypes);
  const rightTabs = getRightPanelTabs(displayedFormTypes);

  const selectedTop = dockLayout.selectedTopTab < topTabs.length ? dockLayout.selectedTopTab : -1;
  const selectedRight = dockLayout.selectedRightTab < rightTabs.length ? dockLayout.selectedRightTab : -1

  return {
    global: globalAttributes,
    borders: [
      {
        type: 'border', location: 'top',
        barSize: 30, size: 90, minSize: 80, selected: selectedTop,
        children: topTabs,
      },
      {
        type: 'border', location: 'right', enableDrop: false,
        barSize: 30, size: dockLayout.rightPanelWidth, minSize: 150, selected: selectedRight,
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
}
