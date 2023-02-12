import { DataSetsAction, DataSetsActions } from './datasets.reducer';


export const setFormRefs = (formID: FormID, value: any): DataSetsAction => {
  return {type: DataSetsActions.SET, formID, value};
};
