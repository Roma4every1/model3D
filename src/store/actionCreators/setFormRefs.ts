import {ActionSet, FormRefsActions} from "../reducers/formRefs";


const setFormRefs = (formID: FormID, value: any): ActionSet => {
  return {type: FormRefsActions.SET, formID, value};
}

export default setFormRefs;
