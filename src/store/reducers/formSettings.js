import SET from '../actions/formSettings/set';
import SET_SERIES_SETTINGS from "../actions/formSettings/setSeriesSettings";

function formSettings(state = [], action) {
    switch (action.type) {
        case SET:
            {
                return {
                    ...state,
                    [action.formId]: action.value
                }
            }

        case SET_SERIES_SETTINGS:
            {
                return {
                    ...state,
                    [action.payload.formID]: {...state[action.payload.formID], seriesSettings: action.payload.data}
                }
            }

        default: return state;
    }
}

export default formSettings;
