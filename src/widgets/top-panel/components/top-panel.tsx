import { FunctionComponent } from 'react';
import { TracePanel } from 'entities/objects';
import { TableEditPanel } from 'features/table';
import { ChartEditPanel } from 'features/chart';
import { MapEditPanel } from 'features/map';
import { TrackEditPanel } from 'features/carat';
import { CaratEditPanel } from 'features/carat';


export interface TopPanelProps {
  panelID: string;
  presentation: PresentationState;
}


/** Словарь всех компонентов верхней панели. */
const editPanelDict: Record<string, [FunctionComponent<FormEditPanelProps>, FormType]> = {
  'top-dataset': [TableEditPanel, 'dataSet'],
  'top-chart': [ChartEditPanel, 'chart'],
  'top-map': [MapEditPanel, 'map'],
  'top-tracks': [TrackEditPanel, 'carat'],
  'top-carat': [CaratEditPanel, 'carat'],
};

/** Панель редактирования формы. */
export const TopPanel = ({panelID, presentation}: TopPanelProps) => {
  if (panelID.endsWith('traces')) {
    const hasMap = presentation?.childrenTypes.has('map') ?? false;
    return <TracePanel hasMap={hasMap}/>;
  }
  const activeChildID = presentation?.activeChildID;
  if (!activeChildID) return null;

  const activeFormType = presentation.children.find(child => child.id === activeChildID).type;
  const [TopTabComponent, formType] = editPanelDict[panelID];

  const formID = activeFormType === formType
    ? activeChildID
    : presentation.children.find(child => child.type === formType).id;

  return <TopTabComponent id={formID} parentID={presentation.id}/>;
};
