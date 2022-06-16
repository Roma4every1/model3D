import {ActionUpdate, FormParamsActions} from "../reducers/formParams";


const updateParam = (formId: FormID, id: ParameterID, value: any, manual: boolean): ActionUpdate => {
  return {type: FormParamsActions.UPDATE, formId, id, value, manual};
}

export default updateParam;
