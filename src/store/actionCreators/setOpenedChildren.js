import SET_OPENED from '../actions/childForms/setOpened';

function setOpenedChildren(formId, values) {
    return {
        type: SET_OPENED,
        formId: formId,
        values: values
    };
}

export default setOpenedChildren;