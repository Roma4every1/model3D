import ADDSET from '../actions/formParams/addSet';

function addParamSet(set) {
    return {
        type: ADDSET,
        set: set
    };
}

export default addParamSet;