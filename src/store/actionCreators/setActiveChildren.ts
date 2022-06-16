import {ChildFormsActions, ActionSetActive} from "../reducers/childForms";


const setActiveChildren = (formId: FormID, values: any): ActionSetActive => {
  return {type: ChildFormsActions.SET_ACTIVE, formId, values};
}

export default setActiveChildren;
