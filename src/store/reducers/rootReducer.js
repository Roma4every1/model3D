import { combineReducers } from 'redux'
import canRunReport from './canRunReport';
import formParams from './formParams';
import sessionId from './sessionId';
import sessionManager from './sessionManager';

const rootReducer = combineReducers({
    canRunReport,
    formParams,
    sessionId,
    sessionManager
});

export default rootReducer;