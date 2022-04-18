import SET_SERIES_SETTINGS from "../actions/formSettings/setSeriesSettings";

function setSeriesSettings(formID, seriesSettings) {
  return {
    type: SET_SERIES_SETTINGS,
    payload: {formID, data: seriesSettings},
  };
}

export default setSeriesSettings;
