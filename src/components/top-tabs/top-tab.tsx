import { FunctionComponent } from "react";
import { useSelector } from "react-redux";
import { selectors } from "../../store";
import { Toolbar } from "@progress/kendo-react-buttons";
import ErrorBoundary from "../common/error-boundary";
import Menu from "./menu";
import SqlProgramsList from "./sql-programs-list";
import DataSetEditPanel from "./dataset-edit-panel";
import ChartEditPanel from "./chart-edit-panel";
import MapEditPanel from "./map-edit-panel";
import TracksEditPanel from "./tracks-edit-panel";
import CaratEditPanel from "./carat-edit-panel";


/** Словарь всех компонентов верхней панели. */
export const topPanelsDict: Record<string, [FunctionComponent<{formID: FormID}>, FormType]> = {
  'top-dataset': [DataSetEditPanel, 'dataSet'],
  'top-chart': [ChartEditPanel, 'chart'],
  'top-map': [MapEditPanel, 'map'],
  'top-tracks': [TracksEditPanel, 'carat'],
  'top-carat': [CaratEditPanel, 'carat'],
};

export function TopTab({id}: {id: string}) {
  const state = useSelector(selectors.displayedPresentationState);
  const activeChildID = state.activeChildren[0];

  if (id === 'top-menu') return <Menu/>;
  if (id === 'top-programs') return <SqlProgramsList formID={activeChildID}/>;

  const activeFormType = state.children.find(child => child.id === activeChildID).type;
  const [TopTabComponent, formType] = topPanelsDict[id];

  const formID = activeFormType === formType
    ? activeChildID
    : state.children.find(child => child.type === formType).id;

  return (
    <ErrorBoundary>
      <Toolbar style={{padding: 1}}>
        <TopTabComponent formID={formID}/>
      </Toolbar>
    </ErrorBoundary>
  );
}
