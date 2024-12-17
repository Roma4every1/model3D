import type { FunctionComponent } from 'react';
import { TraceRibbon } from 'entities/objects';
import { TableEditPanel } from 'features/table';
import { ChartEditPanel } from 'features/chart';
import { MapRibbon } from 'features/map';
import { TrackEditPanel, CaratEditPanel } from 'features/carat';


export interface TopTabProps {
  /** ID вкладки. */
  tabID: string;
  /** Активная презентация. */
  presentation: PresentationState;
}


/** Словарь всех компонентов верхней панели. */
const editPanelDict: Record<string, [FunctionComponent<FormEditPanelProps>, ClientType]> = {
  'top-table': [TableEditPanel, 'dataSet'],
  'top-chart': [ChartEditPanel, 'chart'],
  'top-map': [MapRibbon, 'map'],
  'top-track': [TrackEditPanel, 'carat'],
  'top-carat': [CaratEditPanel, 'carat'],
};

/** Панель редактирования формы. */
export const TopTab = ({tabID, presentation}: TopTabProps) => {
  if (tabID.endsWith('trace')) {
    const hasMap = presentation?.childrenTypes.has('map') ?? false;
    return <TraceRibbon hasMap={hasMap}/>;
  }
  const activeChildID = presentation?.activeChildID;
  if (!activeChildID) return null;

  const activeFormType = presentation.children.find(child => child.id === activeChildID).type;
  const [Component, formType] = editPanelDict[tabID];

  const formID = activeFormType === formType
    ? activeChildID
    : presentation.children.find(child => child.type === formType)?.id;

  if (!formID) return null;
  return <Component id={formID} parentID={presentation.id}/>;
};
