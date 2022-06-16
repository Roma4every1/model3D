import {ActionAddSet, FormParamsActions} from "../reducers/formParams";


const addParamSet = (set: any): ActionAddSet => {
  return {type: FormParamsActions.ADD_SET, set};
}

export default addParamSet;
