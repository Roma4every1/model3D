import SET from '../actions/reports/set';
import CLEAR from '../actions/reports/clear';

function reports(state = [], action) {
    switch (action.type) {
        case SET:
            {
                return {
                    ...state,
                    [action.operationId]: action.value
                }
            }

        case CLEAR:
            {
                if (action.presentationId == null) {
                    return {};
                }
                return Object.fromEntries(Object.entries(state).filter(e => e[1].ID_PR !== action.presentationId));
            }

        default: return state;
    }
}

export default reports;
