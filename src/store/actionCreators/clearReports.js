import CLEAR from '../actions/reports/clear';

function clearReports(presentationId) {
    return {
        type: CLEAR,
        presentationId: presentationId
    };
}

export default clearReports;