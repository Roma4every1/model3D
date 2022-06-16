import {ChildFormsActions, ActionSetOpened} from "../reducers/childForms";


const setOpenedChildren = (formId: FormID, values: any): ActionSetOpened => {
  return {type: ChildFormsActions.SET_OPENED, formId, values};
}

export default setOpenedChildren;
