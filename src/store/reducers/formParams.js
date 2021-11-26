import SET from '../actions/formParams/set';
import ADD from '../actions/formParams/add';
import UPDATE from '../actions/formParams/update';

function formParams(state = [], action) {
    switch (action.type) {
        case SET:
            {
                var newState = [...action.value];
                if (state[action.formId]) {
                    for (let paramId in newState) {
                        if (state[action.formId][paramId]) {
                            newState[paramId] = state[action.formId][paramId]
                        }
                    }
                    for (let paramId in state[action.formId]) {
                        if (!newState[paramId]) {
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
                if (state[action.formId]) {
                    return {
                        ...state,
                        [action.formId]: [
                            ...state[action.formId],
                            action.parameter
                        ]
                    }
                }
                else {
                    return {
                        ...state,
                        [action.formId]: [
                            action.parameter
                        ]
                    }
                }
            }
        case UPDATE:
            {
                const clear = (clearElementId) => {
                    newParamsUpdateForm.forEach(element => {
                        if (element.dependsOn?.includes(clearElementId)) {
                            if (element.value) {
                                element.value = null;
                                clear(element.id);
                            }
                        }
                    });
                }
                var newParamsUpdate = state;
                var newParamsUpdateForm = newParamsUpdate[action.formId];
                var neededParam = newParamsUpdateForm.find(element => element.id === action.id);
                if (neededParam) {
                    neededParam.value = action.value;
                }
                else {
                    newParamsUpdate[action.formId] = [
                        ...newParamsUpdate[action.formId],
                        {
                            id: action.id,
                            value: action.value,
                            type: "string"
                        }
                    ]
                }
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
