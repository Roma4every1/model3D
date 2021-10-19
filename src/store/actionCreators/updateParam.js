import UPDATE from '../actions/formParams/update';

function updateParam(formId, id, value, manual) {
    return {
        type: UPDATE,
        formId: formId,
        id: id,
        value: value,
        manual: manual
    };
}

export default updateParam;