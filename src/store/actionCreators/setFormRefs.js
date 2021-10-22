import SET from '../actions/formRefs/set';

function setFormRefs(formId, value) {
    return {
        type: SET,
        formId: formId,
        value: value
    };
}

export default setFormRefs;