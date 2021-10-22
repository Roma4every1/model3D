import SET from '../actions/formRefs/set';

function formRefs(state = [], action) {
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

export default formRefs;
