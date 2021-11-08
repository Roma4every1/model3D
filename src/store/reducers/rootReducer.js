import { combineReducers } from 'redux'
import canRunReport from './canRunReport';
import channelsData from './channelsData';
import childForms from './childForms';
import formRefs from './formRefs';
import formParams from './formParams';
import layout from './layout';
import sessionId from './sessionId';
import sessionManager from './sessionManager';
import windowData from './windowData';

const rootReducer = combineReducers({
    canRunReport,
    channelsData,
    childForms,
    formRefs,
    formParams,
    layout,
    sessionId,
    sessionManager,
    windowData
});

export default rootReducer;