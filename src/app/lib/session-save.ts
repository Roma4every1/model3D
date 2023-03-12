import { IJsonModel } from 'flexlayout-react';
import { serializeParameter } from 'entities/parameters';
import { TableFormSettings, tableStateToFormSettings } from 'features/table';


type FormParamsArray = {id: FormID, value: SerializedParameter[]}[];
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
    layout: getLayoutsToSave(state.root, state.presentations),
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
    openedChildren: state.openedChildren,
    activeChildren: state.activeChildID ? [state.activeChildID] : [],
  };
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

function getLayoutsToSave(root: RootFormState, presentations: PresentationDict): FormLayoutArray {
  const layoutArray: FormLayoutArray = [getRootLayout(root)];
  for (const id in presentations) layoutArray.push({...presentations[id].layout, id});
  return layoutArray;
}

function getRootLayout(root: RootFormState): any {
  const { common, left } = root.layout;
  const model = left.model.toJson();

  model.id = root.id;
  model.layout = {
    ...model.layout,
    sizeleft: common.leftPanelWidth,
    sizeright: common.rightPanelWidth,
    selectedtop: common.selectedTopTab,
    selectedleft: 0,
    selectedright: common.selectedRightTab
  };
  return model;
}
