import { IJsonModel } from 'flexlayout-react';
import { serializeParamValue } from './params.utils';


type FormParameterToSave = Omit<FormParameter, 'value'> & {value: string};
type FormParamsArray = {id: FormID, value: FormParameterToSave[]}[];

type FormLayoutArray = ({id: FormID} & IJsonModel)[];
type FormSettingsArray = ({id: FormID} & FormSettings)[];

/** Модель, используемая в серверных запросах для сохранения сессии. */
export interface SessionToSave {
  sessionId: SessionID,
  activeParams: FormParamsArray,
  children: FormChildrenState[],
  layout: FormLayoutArray,
  settings: FormSettingsArray,
}


export function getSessionToSave(state: WState): SessionToSave {
  const rootFormID = state.appState.rootFormID;
  return {
    sessionId: state.appState.sessionID.data,
    activeParams: getParametersToSave(state.formParams),
    children: getChildrenToSave(state.childForms, rootFormID),
    layout: getLayoutsToSave(state.formLayout),
    settings: getSettingsToSave(state.formSettings),
  };
}

/* --- Parameters --- */

function getParametersToSave(formParams: FormParams): FormParamsArray {
  const paramsArray: FormParamsArray  = [];
  for (const id in formParams) {
    const value = formParams[id].map(serializeParam);
    paramsArray.push({id, value});
  }
  return paramsArray;
}

function serializeParam(param): FormParameterToSave {
  const valueString = serializeParamValue(param.type, param.value);
  return {...param, value: valueString};
}

/* --- Children --- */

function getChildrenToSave(childForms: ChildForms, rootFormID: FormID): FormChildrenState[] {
  const childArray: FormChildrenState[] = [];
  const multiMapsID: FormID[] = [];

  for (let form in childForms) {
    const formChildren = childForms[form];
    if (formChildren.id === rootFormID) {
      const correctedChildren: FormChildren = [];
      for (const child of formChildren.children) {
        if (child.type === 'multiMap') {
          multiMapsID.push(child.id);
        } else {
          correctedChildren.push(child);
        }
      }
      childArray.push({...formChildren, children: correctedChildren});
    } else {
      if (!multiMapsID.includes(formChildren.id)) childArray.push(formChildren);
    }
  }
  return childArray;
}

/* --- Settings --- */

function getSettingsToSave(formsSettings: FormsSettings): FormSettingsArray {
  const settingsArray: FormSettingsArray = [];
  for (const id in formsSettings) {
    const formSettings = formsSettings[id];
    if (formSettings.hasOwnProperty('columns'))
      settingsArray.push({...formSettings, id});
  }
  return settingsArray;
}

/* --- Layout --- */

function getLayoutsToSave(formsLayout: FormsLayout): FormLayoutArray {
  const layoutArray: FormLayoutArray = [];
  for (const id in formsLayout) layoutArray.push({...formsLayout[id], id});
  return layoutArray;
}
