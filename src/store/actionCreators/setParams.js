import SET from '../actions/formParams/set';

function setParams(formId, value) {
    return {
        type: SET,
        formId: formId,
        value: value
    };
}

export default setParams;