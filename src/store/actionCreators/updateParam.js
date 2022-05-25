import UPDATE from "../actions/formParams/update";


function updateParam(formId, id, value, manual) {
    return {type: UPDATE, formId, id, value, manual};
}

export default updateParam;
