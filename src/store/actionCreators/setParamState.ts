import {FormStatesActions, ActionSetParamValue} from "../reducers/formStates";


const setParamState = (formID: FormID, paramID: ParameterID, state: ParamState<any>): ActionSetParamValue => {
  return {type: FormStatesActions.SET_PARAM_VALUE, payload: {formID, paramID, state}};
}

export default setParamState;
