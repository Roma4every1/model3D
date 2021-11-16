import SET from '../actions/reports/set';

function reports(state = [], action) {
    switch (action.type) {
        case SET:
            {
                return {
                    ...state,
                    [action.operationId]: action.value
                }
            }

        default: return state;
    }
}

export default reports;
