import SET_PLUGINS from '../actions/layout/setPlugins';

function layout(state = [], action) {
    switch (action.type) {

        case SET_PLUGINS:
            {
                return action.value;
            }

        default: return state;
    }
}

export default layout;
