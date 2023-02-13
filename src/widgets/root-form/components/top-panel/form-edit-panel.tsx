import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { displayedPresentationSelector } from 'widgets/presentation';

import { DataSetEditPanel } from 'features/dataset';
import { ChartEditPanel } from 'features/chart';
import { MapEditPanel } from 'features/map';
import { TracksEditPanel } from 'features/carat';
import { CaratEditPanel } from 'features/carat';


/** Словарь всех компонентов верхней панели. */
const editPanelDict: Record<string, [FunctionComponent<FormEditPanelProps>, FormType]> = {
  'top-dataset': [DataSetEditPanel, 'dataSet'],
  'top-chart': [ChartEditPanel, 'chart'],
  'top-map': [MapEditPanel, 'map'],
  'top-tracks': [TracksEditPanel, 'carat'],
  'top-carat': [CaratEditPanel, 'carat'],
};

/** Панель редактирования формы. */
export const FormEditPanel = ({id}: {id: string}) => {
  const presentation = useSelector(displayedPresentationSelector);
  if (!presentation) return null;

  const activeChildID = presentation.activeChildID;
  const activeFormType = presentation.children.find(child => child.id === activeChildID).type;
  const [TopTabComponent, formType] = editPanelDict[id];

  const formID = activeFormType === formType
    ? activeChildID
    : presentation.children.find(child => child.type === formType).id;

  return <TopTabComponent id={formID} parentID={presentation.id}/>;
};
