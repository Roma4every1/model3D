import {ActionUpdateSet, FormParamsActions} from "../reducers/formParams";


const updateParamSet = (formId: FormID, values: any): ActionUpdateSet => {
    return {type: FormParamsActions.UPDATE_SET, formId, values};
}

export default updateParamSet;
