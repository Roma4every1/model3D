import { combineReducers } from "redux";

import canRunReport from "./canRunReport";
import channelsData from "./channelsData";
import channelsLoading from "./channelsLoading";
import childForms from "./childForms";
import formRefs from "./formRefs";
import formParams from "./formParams";
import formSettings from "./formSettings";
import layout from "./layout";
import plugins from "./plugins";
import reports from "./reports";
import sessionId from "./sessionId";
import sessionManager from "./sessionManager";
import windowData from "./windowData";


const rootReducer = combineReducers({
    canRunReport,
    channelsData, channelsLoading,
    childForms,
    formRefs, formParams, formSettings,
    layout,
    plugins,
    reports,
    sessionId, sessionManager,
    windowData
});

export default rootReducer;
