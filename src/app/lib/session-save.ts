import { IJsonModel } from 'flexlayout-react';
import { serializeParameter } from 'entities/parameters';
import { TableFormSettings, tableStateToFormSettings } from 'features/table';


type FormParamsArray = {id: FormID, value: SerializedFormParameter[]}[];
type FormLayoutArray = ({id: FormID} & IJsonModel)[];
type FormSettingsArray = TableFormSettings[];

/** Модель, используемая в серверных запросах для сохранения сессии. */
export interface SessionToSave {
  sessionId: SessionID,
  activeParams: FormParamsArray,
  children: FormChildrenState[],
  layout: FormLayoutArray,
  settings: FormSettingsArray,
}


export function getSessionToSave(state: WState): SessionToSave {
  return {
    sessionId: state.appState.sessionID,
    activeParams: getParametersToSave(state.parameters),
    children: getChildrenToSave(state.root, state.presentations),
    layout: getLayoutsToSave(state.presentations),
    settings: getSettingsToSave(state.tables),
  };
}

/* --- Parameters --- */

function getParametersToSave(formParams: ParamDict): FormParamsArray {
  const paramsArray: FormParamsArray  = [];
  for (const id in formParams) {
    const value = formParams[id].map(serializeParameter);
    paramsArray.push({id, value});
  }
  return paramsArray;
}

/* --- Children --- */

function getChildrenToSave(root: RootFormState, presentations: PresentationDict): FormChildrenState[] {
  const childArray = Object.values(presentations).map(presentationStateToChildren);
  childArray.push({
    id: root.id,
    children: root.children,
    openedChildren: [root.activeChildID],
    activeChildren: [root.activeChildID],
  });
  return childArray;
}

function presentationStateToChildren(state: PresentationState): FormChildrenState {
  return {
    id: state.id,
    children: state.children,
    openedChildren: state.children.map(child => child.id),
    activeChildren: [state.activeChildID],
  }
}

/* --- Settings --- */

function getSettingsToSave(tableStates: TablesState): FormSettingsArray {
  const settingsArray: FormSettingsArray = [];
  for (const id in tableStates) {
    const tableState = tableStates[id];
    settingsArray.push(tableStateToFormSettings(id, tableState));
  }
  return settingsArray;
}

/* --- Layout --- */

function getLayoutsToSave(formsLayout: PresentationDict): FormLayoutArray {
  const layoutArray: FormLayoutArray = [];
  for (const id in formsLayout) layoutArray.push({...formsLayout[id].layout, id});
  return layoutArray;
}
