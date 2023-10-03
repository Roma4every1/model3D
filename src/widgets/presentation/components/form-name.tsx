import { useSelector } from 'react-redux';
import { compareObjects } from 'shared/lib';
import { getDisplayName } from '../lib/display-name-string';
import { FormDisplayNamePattern, ParamValuesDict } from '../lib/display-name-string';


interface FormNameProps {
  formID: FormID,
  pattern: FormDisplayNamePattern,
  params: ParameterID[],
}


function getParamValues(this: {formID: FormID, params: ParameterID[]}, state: WState) {
  const dict: ParamValuesDict = {};
  const parent = state.forms[this.formID]?.parent;
  if (!parent) return dict;

  const parentFormParams = state.parameters[parent];
  const globalParams = state.parameters[state.root.id];

  for (const paramID of this.params) {
    const findByID = (param) => param.id === paramID;

    const fromGlobal = globalParams.find(findByID);
    if (fromGlobal) { dict[paramID] = fromGlobal.value; continue; }

    const fromParent = parentFormParams.find(findByID);
    if (fromParent) dict[paramID] = fromParent.value;
  }
  return dict;
}

/** Динамический заголовок формы. */
export const FormName = ({formID, pattern, params}: FormNameProps) => {
  const selector = getParamValues.bind({formID, params});
  const dict: ParamValuesDict = useSelector(selector, compareObjects);

  return <>{getDisplayName(pattern, dict)}</>;
};
