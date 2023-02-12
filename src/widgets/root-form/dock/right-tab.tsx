import { useSelector } from 'react-redux';
import { MapLayersTree } from '../../../features/map/components/layers-tree/layers-tree';
import { displayedPresentationSelector } from 'widgets/presentation';


export const RightTab = () => {
  const presentation = useSelector(displayedPresentationSelector);
  if (!presentation) return null;

  const activeChildID = presentation.activeChildID;
  const activeFormType = presentation.children.find(child => child.id === activeChildID).type;
  const formID = activeFormType === 'map'
    ? activeChildID
    : presentation.children.find(child => child.type === 'map').id;

  return <MapLayersTree formID={formID}/>;
};
