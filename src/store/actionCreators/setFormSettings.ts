import {ActionSet, FormSettingsActions} from "../reducers/formSettings";


const setFormSettings = (formId, value): ActionSet => {
  return {type: FormSettingsActions.SET, formId, value};
}

export default setFormSettings;
