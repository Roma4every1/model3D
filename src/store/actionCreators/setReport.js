import SET from '../actions/reports/set';

function setReport(operationId, value) {
    return {
        type: SET,
        operationId: operationId,
        value: value
    };
}

export default setReport;