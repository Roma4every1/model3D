import SET_PLUGINS from '../actions/layout/setPlugins';

function setPlugins(value) {
    return {
        type: SET_PLUGINS,
        value: value
    };
}

export default setPlugins;