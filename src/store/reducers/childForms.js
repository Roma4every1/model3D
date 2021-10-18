import SET from '../actions/childForms/set';
import SET_OPENED from '../actions/childForms/setOpened';
import SET_ACTIVE from '../actions/childForms/setActive';

function childForms(state = [], action) {
    switch (action.type) {
        case SET:
            {
                return {
                    ...state,
                    [action.formId]: action.value
                }
            }

        case SET_OPENED:
            {
                return {
                    ...state,
                    [action.formId]:
                    {
                        ...state[action.formId],
                        openedChildren: action.values
                    }
                }
            }

        case SET_ACTIVE:
            {
                return {
                    ...state,
                    [action.formId]:
                    {
                        ...state[action.formId],
                        activeChildren: action.values
                    }
                }
            }

        default: return state;
    }
}

export default childForms;
