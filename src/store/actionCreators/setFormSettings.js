import SET from '../actions/formSettings/set';

function setFormSettings(formId, value) {
    return {
        type: SET,
        formId: formId,
        value: value
    };
}

export default setFormSettings;