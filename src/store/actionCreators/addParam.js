import ADD from '../actions/formParams/add';

function addParam(formId, parameter) {
    return {
        type: ADD,
        formId: formId,
        parameter: parameter
    };
}

export default addParam;