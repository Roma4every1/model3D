import SET from '../actions/formParams/set';
import ADD from '../actions/formParams/add';
import UPDATE from '../actions/formParams/update';

function formParams(state = [], action) {
    switch (action.type) {
        case SET:
            {
                var newState = [...action.value];
                if (state[action.formId]) {
                    for (var paramId in newState) {
                        if (state[action.formId][paramId]) {
                            newState[paramId] = state[action.formId][paramId]
                        }
                    }
                }
                return {
                    ...state,
                    [action.formId]: newState
                }
            }
        case ADD:
            {
                return {
                    ...state,
                    [action.formId]: [
                        ...state[action.formId],
                        action.parameter
                        ]
                }
            }
        case UPDATE:
            {
                const clear = (clearElementId) => {
                    newParamsUpdateForm.forEach(element => {
                        if (element.dependsOn?.includes(clearElementId)) {
                            element.value = null;
                            clear(element.id);
                        }
                    });
                }
                var newParamsUpdate = state;
                var newParamsUpdateForm = newParamsUpdate[action.formId];
                newParamsUpdateForm.forEach(element => {
                    if (element.id === action.id) {
                        element.value = action.value;
                    }
                });
                if (action.manual) {
                    clear(action.id);
                }
                return {
                    ...state
                }
            }

        default: return state;
    }
}

export default formParams;
