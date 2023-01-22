import { useSelector } from "react-redux";
import { compareObjects, getParentFormId } from "../../../utils/utils";
import { getDisplayName } from "../../../utils/display-name-string";
import { FormDisplayNamePattern, ParamValuesDict } from "../../../utils/display-name-string";


interface FormNameProps {
  formID: FormID,
  pattern: FormDisplayNamePattern,
  params: ParameterID[],
}


function getParamValues(this: {formID: FormID, params: ParameterID[]}, state: WState) {
  const globalParams = state.formParams[state.appState.rootFormID];
  const parentFormParams = state.formParams[getParentFormId(this.formID)];
  const formParams = state.formParams[this.formID];

  const dict: ParamValuesDict = {};
  if (!formParams) return dict;

  for (const paramID of this.params) {
    const findByID = (param) => param.id === paramID;

    const fromGlobal = globalParams.find(findByID);
    if (fromGlobal) { dict[paramID] = fromGlobal.value; continue; }

    const fromParent = parentFormParams.find(findByID);
    if (fromParent) { dict[paramID] = fromParent.value; continue; }

    const fromForm = formParams.find(findByID);
    if (fromForm) dict[paramID] = fromForm.value;
  }
  return dict;
}

/** Динамический заголовок формы. */
export const FormName = ({formID, pattern, params}: FormNameProps) => {
  const selector = getParamValues.bind({formID, params});
  const dict: ParamValuesDict = useSelector(selector, compareObjects);

  return <>{getDisplayName(pattern, dict)}</>;
};
