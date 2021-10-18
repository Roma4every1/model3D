import SET from '../actions/childForms/set';

function setChildForms(formId, value) {
    return {
        type: SET,
        formId: formId,
        value: value
    };
}

export default setChildForms;