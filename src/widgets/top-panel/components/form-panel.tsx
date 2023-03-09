import { FunctionComponent } from 'react';
import { DataSetEditPanel } from 'features/dataset';
import { ChartEditPanel } from 'features/chart';
import { MapEditPanel } from 'features/map';
import { TracksEditPanel } from 'features/carat';
import { CaratEditPanel } from 'features/carat';
import {
  TracesEditPanel
} from "../../../features/map/components/edit-panel/editing/traces-edit-panel";




export interface FormPanelProps {
  panelID: string,
  presentation: PresentationState,
}

/** Словарь всех компонентов верхней панели. */
const editPanelDict: Record<string, [FunctionComponent<FormEditPanelProps>, FormType]> = {
  'top-dataset': [DataSetEditPanel, 'dataSet'],
  'top-chart': [ChartEditPanel, 'chart'],
  'top-map': [MapEditPanel, 'map'],
  'top-traces': [TracesEditPanel, 'map'],
  'top-tracks': [TracksEditPanel, 'carat'],
  'top-carat': [CaratEditPanel, 'carat'],
};

/** Панель редактирования формы. */
export const FormPanel = ({panelID, presentation}: FormPanelProps) => {
  if (!presentation) return null;

  const activeChildID = presentation.activeChildID;
  const activeFormType = presentation.children.find(child => child.id === activeChildID).type;
  const [TopTabComponent, formType] = editPanelDict[panelID];

  const formID = activeFormType === formType
    ? activeChildID
    : presentation.children.find(child => child.type === formType).id;

  return <TopTabComponent id={formID} parentID={presentation.id}/>;
};
