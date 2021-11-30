import SET from '../actions/formSettings/set';

function formSettings(state = [], action) {
    switch (action.type) {
        case SET:
            {
                return {
                    ...state,
                    [action.formId]: action.value
                }
            }

        default: return state;
    }
}

export default formSettings;
