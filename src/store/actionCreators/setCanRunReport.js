import SET from '../actions/canRunReport/set';

function setCanRunReport(value) {
    return {
        type: SET,
        value: value
    };
}

export default setCanRunReport;