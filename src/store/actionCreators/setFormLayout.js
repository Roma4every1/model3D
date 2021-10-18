import SET from '../actions/layout/set';

function setFormLayoutForms(formId, value) {
    return {
        type: SET,
        formId: formId,
        value: value
    };
}

export default setFormLayoutForms;