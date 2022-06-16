import {ActionAdd, FormParamsActions} from "../reducers/formParams";


const addParam = (formId: FormID, parameter: any): ActionAdd => {
  return {type: FormParamsActions.ADD, formId, parameter};
}

export default addParam;
