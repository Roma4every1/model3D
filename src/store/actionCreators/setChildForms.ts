import {ChildFormsActions, ActionSet} from "../reducers/childForms";


const setChildForms = (formId: FormID, value: any): ActionSet => {
  return {type: ChildFormsActions.SET, formId, value};
}

export default setChildForms;
