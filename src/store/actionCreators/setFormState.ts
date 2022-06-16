import {FormStatesActions, ActionSet} from "../reducers/formStates";


const setFormState = (formID: FormID, state: FormState): ActionSet => {
  return {type: FormStatesActions.SET, payload: {formID, state}};
}

export default setFormState;
