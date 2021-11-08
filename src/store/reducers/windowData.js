import SET from '../actions/windowData/set';
import CLOSE from '../actions/windowData/close';

function windowData(state = null, action) {
    switch (action.type) {
        case SET: return {
            opened: true,
            text: action.text,
            type: action.windowType
        };

        case CLOSE: return {
            opened: false
        };

        default: return state;
    }
}

export default windowData;