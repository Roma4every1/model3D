import SET from '../actions/formParams/set';
import ADD from '../actions/formParams/add';
import ADDSET from '../actions/formParams/addSet';
import UPDATE from '../actions/formParams/update';
import UPDATESET from '../actions/formParams/updateSet';

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
        case ADDSET:
            {
                if (state[action.set.channelName]) {
                    return {
                        ...state,
                        [action.set.channelName]: [
                            ...state[action.set.channelName],
                            ...action.set.params
                        ]
                    }
                }
                else {
                    return {
                        ...state,
                        [action.set.channelName]: [
                            ...action.set.params
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
                let newParamsUpdate = state;
                let newParamsUpdateForm = newParamsUpdate[action.formId];
                let neededParam = newParamsUpdateForm.find(element => element.id === action.id);
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
        case UPDATESET:
            {
                if (state[action.formId]) {
                    let newParamsUpdateForm = [...state[action.formId]];
                    action.values.forEach(val => {
                        var neededParam = newParamsUpdateForm.find(element => element.id === val.name);
                        if (neededParam) {
                            neededParam.value = val.value;
                        }
                    });
                    return {
                        ...state,
                        [action.formId]: [
                            ...newParamsUpdateForm
                        ]
                    }
                }
                else {
                    return {
                        ...state,
                        [action.formId]: [
                            ...action.values
                        ]
                    }
                }
            }

        default: return state;
    }
}

export default formParams;
