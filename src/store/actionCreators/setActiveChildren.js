import SET_ACTIVE from '../actions/childForms/setActive';

function setActiveChildren(formId, values) {
    return {
        type: SET_ACTIVE,
        formId: formId,
        values: values
    };
}

export default setActiveChildren;