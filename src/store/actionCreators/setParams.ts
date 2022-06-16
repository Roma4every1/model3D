import {ActionSet, FormParamsActions} from "../reducers/formParams";


const setParams = (formId: FormID, value: any): ActionSet => {
  return {type: FormParamsActions.SET, formId, value};
}

export default setParams;
