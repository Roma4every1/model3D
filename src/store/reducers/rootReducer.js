import { combineReducers } from 'redux'
import canRunReport from './canRunReport';
import childForms from './childForms';
import formParams from './formParams';
import layout from './layout';
import sessionId from './sessionId';
import sessionManager from './sessionManager';

const rootReducer = combineReducers({
    canRunReport,
    childForms,
    formParams,
    layout,
    sessionId,
    sessionManager
});

export default rootReducer;