import { useSelector } from "react-redux";
import { selectors } from "../../store";
import ErrorBoundary from "../common/error-boundary";
import MapLayersTree from "./layers-tree";


export function RightTab() {
  const presentation = useSelector(selectors.displayedPresentation);
  if (!presentation) return null;

  const activeChildID = presentation.activeChildren[0];
  const activeFormType = presentation.children.find(child => child.id === activeChildID).type;
  const formID = activeFormType === 'map'
    ? activeChildID
    : presentation.children.find(child => child.type === 'map').id;

  return <ErrorBoundary><MapLayersTree formID={formID}/></ErrorBoundary>;
}
