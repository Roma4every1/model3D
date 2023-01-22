import { FunctionComponent } from "react";
import { useSelector } from "react-redux";
import { selectors } from "../../store";

import { SqlProgramsList } from "./sql-programs-list";
import { DataSetEditPanel } from "./dataset-edit-panel";
import { ChartEditPanel } from "./chart-edit-panel";
import { MapEditPanel } from "./map-edit-panel";
import { TracksEditPanel } from "./tracks-edit-panel";
import { CaratEditPanel } from "./carat-edit-panel";


/** Словарь всех компонентов верхней панели. */
export const topPanelsDict: Record<string, [FunctionComponent<PropsFormID>, FormType]> = {
  'top-dataset': [DataSetEditPanel, 'dataSet'],
  'top-chart': [ChartEditPanel, 'chart'],
  'top-map': [MapEditPanel, 'map'],
  'top-tracks': [TracksEditPanel, 'carat'],
  'top-carat': [CaratEditPanel, 'carat'],
};

export function TopTab({id}: {id: string}) {
  const presentation = useSelector(selectors.displayedPresentation);
  if (!presentation) return null;
  if (id === 'top-programs') return <SqlProgramsList formID={presentation.id}/>;

  const activeChildID = presentation.activeChildren[0];
  const activeFormType = presentation.children.find(child => child.id === activeChildID).type;
  const [TopTabComponent, formType] = topPanelsDict[id];

  const formID = activeFormType === formType
    ? activeChildID
    : presentation.children.find(child => child.type === formType).id;

  return <TopTabComponent formID={formID}/>;
}
