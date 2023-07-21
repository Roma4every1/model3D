import { IJsonModel } from 'flexlayout-react';
import { serializeParameter } from 'entities/parameters';
import { TableFormSettings, tableStateToFormSettings } from 'features/table';
import { caratStateToSettings } from 'features/carat';


/** Модель, используемая в серверных запросах для сохранения сессии. */
export interface SessionToSave {
  sessionId: SessionID,
  parameters: FormParamsArray,
  children: FormChildrenState[],
  layout: FormLayoutArray,
  settings: SessionSettings,
}

interface SessionSettings {
  tables: TableFormSettings[],
  carats: CaratFormSettings[],
}

type FormParamsArray = {id: FormID, value: SerializedParameter[]}[];
type FormLayoutArray = ({id: FormID} & IJsonModel)[];


export function getSessionToSave(state: WState): SessionToSave {
  return {
    sessionId: state.appState.sessionID,
    parameters: getParametersToSave(state.parameters),
    children: getChildrenToSave(state.root, state.presentations),
    layout: getLayoutsToSave(state.root, state.presentations),
    settings: getSettingsToSave(state.tables, state.carats),
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
  const childArray = Object.values(presentations)
    .filter(p => !p.settings.multiMapChannel)
    .map(presentationStateToChildren);

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

function getSettingsToSave(tableStates: TableStates, caratsState: CaratStates): SessionSettings {
  const tables: TableFormSettings[] = [];
  const carats: CaratFormSettings[] = [];

  for (const id in tableStates) {
    const tableState = tableStates[id];
    tables.push(tableStateToFormSettings(id, tableState));
  }
  for (const id in caratsState) {
    const caratState = caratsState[id];
    carats.push(caratStateToSettings(id, caratState));
  }
  return {tables, carats};
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
