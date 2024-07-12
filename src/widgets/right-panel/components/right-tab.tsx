import type { FunctionComponent } from 'react';
import { TraceEditor } from 'entities/objects';
import { MapLayerTree } from 'features/map';
import { ProfileEditor } from 'features/profile';


export interface RightTabProps {
  /** ID вкладки. */
  tabID: string;
  /** Активная презентация. */
  presentation: PresentationState;
}


export const RightTab = ({tabID, presentation}: RightTabProps) => {
  const activeChildID = presentation?.activeChildID;
  if (!activeChildID) return null;

  let formType: ClientType;
  let Component: FunctionComponent<{id: FormID}>;

  if (tabID.endsWith('map')) {
    formType = 'map';
    Component = MapLayerTree;
  } else if (tabID.endsWith('trace')) {
    formType = 'map';
    Component = TraceEditor;
  } else if (tabID.endsWith('profile')) {
    formType = 'profile';
    Component = ProfileEditor;
  } else {
    return null;
  }

  const activeChild = presentation.children.find(child => child.id === activeChildID);
  const formID = activeChild.type === formType
    ? activeChildID
    : presentation.children.find(child => child.type === formType)?.id;

  if (!formID) return null;
  return <Component id={formID}/>
};
