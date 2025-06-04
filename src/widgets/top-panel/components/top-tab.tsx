import type { FunctionComponent } from 'react';
import { TraceRibbon, SelectionRibbon, SiteRibbon } from 'entities/objects';
import { TableRibbon } from 'features/table';
import { ChartRibbon } from 'features/chart';
import { MapRibbon } from 'features/map';
import { TrackEditPanel, CaratEditPanel } from 'features/carat';
import { ProfileRibbon } from 'features/profile';


export interface TopTabProps {
  /** ID вкладки. */
  tabID: string;
  /** Активная презентация. */
  presentation: PresentationState;
}

/** Словарь всех компонентов верхней панели. */
const editPanelDict: Record<string, [FunctionComponent<FormRibbonProps>, ClientType]> = {
  'top-table': [TableRibbon, 'dataSet'],
  'top-chart': [ChartRibbon, 'chart'],
  'top-map': [MapRibbon, 'map'],
  'top-track': [TrackEditPanel, 'carat'],
  'top-carat': [CaratEditPanel, 'carat'],
  'top-profile': [ProfileRibbon, 'profile'],
};

/** Панель редактирования формы. */
export const TopTab = ({tabID, presentation}: TopTabProps) => {
  const hasMap = presentation?.childrenTypes.has('map') ?? false;
  if (tabID.endsWith('trace')) return <TraceRibbon hasMap={hasMap}/>;
  if (tabID.endsWith('site')) return <SiteRibbon hasMap={hasMap}/>;
  if (tabID.endsWith('selection')) return <SelectionRibbon hasMap={hasMap}/>;

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
