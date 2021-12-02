import UPDATESET from '../actions/formParams/updateSet';

function updateParamSet(formId, values) {
    return {
        type: UPDATESET,
        formId: formId,
        values: values
    };
}

export default updateParamSet;