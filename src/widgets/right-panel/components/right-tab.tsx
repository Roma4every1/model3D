import { TraceEditor } from 'entities/objects';
import { MapLayerTree } from 'features/map';


export interface RightTabProps {
  /** ID вкладки. */
  tabID: string;
  /** Активная презентация. */
  presentation: PresentationState;
}


export const RightTab = ({tabID, presentation}: RightTabProps) => {
  if (!presentation) return null;

  const activeChildID = presentation.activeChildID;
  const activeFormType = presentation.children.find(child => child.id === activeChildID).type;

  const formID = activeFormType === 'map'
    ? activeChildID
    : presentation.children.find(child => child.type === 'map').id;

  return tabID === 'right-trace' ? <TraceEditor id={formID}/> : <MapLayerTree id={formID}/>;
};
