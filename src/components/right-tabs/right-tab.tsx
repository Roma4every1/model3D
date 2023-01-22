import { useSelector } from "react-redux";
import MapLayersTree from "./layers-tree";
import { selectors } from "../../store";


export function RightTab() {
  const presentation = useSelector(selectors.displayedPresentation);
  if (!presentation) return null;

  const activeChildID = presentation.activeChildren[0];
  const activeFormType = presentation.children.find(child => child.id === activeChildID).type;
  const formID = activeFormType === 'map'
    ? activeChildID
    : presentation.children.find(child => child.type === 'map').id;

  return <MapLayersTree formID={formID}/>;
}
