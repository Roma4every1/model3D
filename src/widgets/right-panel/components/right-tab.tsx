import { TraceEditor } from 'entities/objects';
import { MapLayerTree } from 'features/map';
import {createElement} from "react";
import {ProfileEditor} from "../../../features/profile/components/profile-editor.tsx";


export interface RightTabProps {
  /** ID вкладки. */
  tabID: string;
  /** Активная презентация. */
  presentation: PresentationState;
}

type RightTabComponent = typeof MapLayerTree | typeof TraceEditor;

const rightTabComponentsDict: Record<string, RightTabComponent> = {
  'right-map': MapLayerTree,
  'right-trace': TraceEditor,
  'right-profile': ProfileEditor
}

export const RightTab = ({tabID, presentation}: RightTabProps) => {
  if (!presentation) return null;

  const activeChildID = presentation.activeChildID;
  const activeFormType = presentation.children.find(child => child.id === activeChildID).type;

  const formID = activeFormType === 'map' || activeFormType === 'profile'
    ? activeChildID
    : presentation.children.find(child => child.type === 'map').id;

  const component = rightTabComponentsDict[tabID];
  return createElement(component, {id: formID});
};
