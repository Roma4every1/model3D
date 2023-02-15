import { MapLayerTree } from 'features/map';


export interface RightTabProps {
  presentation: PresentationState,
}


export const RightTab = ({presentation}: RightTabProps) => {
  if (!presentation) return null;

  const activeChildID = presentation.activeChildID;
  const activeFormType = presentation.children.find(child => child.id === activeChildID).type;

  const formID = activeFormType === 'map'
    ? activeChildID
    : presentation.children.find(child => child.type === 'map').id;

  return <MapLayerTree formID={formID}/>;
};
