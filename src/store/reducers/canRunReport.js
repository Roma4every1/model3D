import SET from '../actions/canRunReport/set';

function canRunReport(state = false, action) {
    switch (action.type) {
        case SET: return action.value;

        default: return state;
    }
}

export default canRunReport;