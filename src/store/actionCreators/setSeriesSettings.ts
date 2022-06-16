import {ActionSetSeriesSetting, FormSettingsActions} from "../reducers/formSettings";


function setSeriesSettings(formID, seriesSettings): ActionSetSeriesSetting {
  return {type: FormSettingsActions.SET_SERIES_SETTINGS, payload: {formID, data: seriesSettings}};
}

export default setSeriesSettings;
