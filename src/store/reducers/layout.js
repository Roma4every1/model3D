import SET from '../actions/layout/set';

function layout(state = [], action) {
    switch (action.type) {
        case SET:
            {
                if (action.force) {
                    delete (state[action.formId]);
                }
                return {
                    ...state,
                    [action.formId]: action.value
                }
            }

        default: return state;
    }
}

export default layout;
