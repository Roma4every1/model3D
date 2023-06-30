import { TracesEditTab } from 'entities/objects';
import { MapLayerTree } from 'features/map';


export interface RightTabProps {
  panelID: string,
  presentation: PresentationState,
}


export const RightTab = ({panelID, presentation}: RightTabProps) => {
  if (!presentation) return null;

  const activeChildID = presentation.activeChildID;
  const activeFormType = presentation.children.find(child => child.id === activeChildID).type;

  const formID = activeFormType === 'map'
    ? activeChildID
    : presentation.children.find(child => child.type === 'map').id;

  return panelID === 'right-trace'
    ? <TracesEditTab formID={formID}/>
    : <MapLayerTree formID={formID}/>;
};
