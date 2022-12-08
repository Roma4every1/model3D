import { useSelector } from "react-redux";
import { selectors } from "../../store";
import ErrorBoundary from "../common/error-boundary";
import DownloadFiles from "./download-files";
import MapLayersTree from "./layers-tree";


export function RightTab({id}: {id: string}) {
  const state = useSelector(selectors.displayedPresentationState);
  const activeChildID = state.activeChildren[0];

  if (id === 'right-dock') // 'id' is 'right-dock or 'right-map'
    return <ErrorBoundary><DownloadFiles formID={activeChildID}/></ErrorBoundary>;

  const activeFormType = state.children.find(child => child.id === activeChildID).type;
  const formID = activeFormType === 'map'
    ? activeChildID
    : state.children.find(child => child.type === 'map').id;

  return <ErrorBoundary><MapLayersTree formID={formID}/></ErrorBoundary>;
}
