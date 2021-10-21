import SET from '../actions/layout/set';
import SET_PLUGINS from '../actions/layout/setPlugins';

function layout(state = [], action) {
    switch (action.type) {
        case SET:
            {
                return {
                    ...state,
                    [action.formId]: action.value
                }
            }

        case SET_PLUGINS:
            {
                return {
                    ...state,
                    "plugins": action.value
                }
            }

        default: return state;
    }
}

export default layout;
