import { combineReducers } from "redux";

import { appStateReducer } from "./reducers/appState";
import { canRunReportReducer } from "./reducers/canRunReport";
import { channelsDataReducer } from "./reducers/channelsData";
import { channelsLoadingReducer } from "./reducers/channelsLoading";
import { childFormsReducer } from "./reducers/childForms";
import { formRefsReducer } from "./reducers/formRefs";
import { formParamsReducer } from "./reducers/formParams";
import { formSettingsReducer } from "./reducers/formSettings";
import { layoutReducer } from "./reducers/layout";
import { mapsReducer } from "./reducers/maps";
import { reportsReducer } from "./reducers/reports";
import { sessionIdReducer } from "./reducers/sessionId";
import { sessionManagerReducer } from "./reducers/sessionManager";
import { windowDataReducer } from "./reducers/windowData";


const rootReducer = combineReducers({
    appState: appStateReducer,
    canRunReport: canRunReportReducer,
    channelsData: channelsDataReducer,
    channelsLoading: channelsLoadingReducer,
    childForms: childFormsReducer,
    formParams: formParamsReducer,
    formRefs: formRefsReducer,
    formSettings: formSettingsReducer,
    layout: layoutReducer,
    maps: mapsReducer,
    reports: reportsReducer,
    sessionId: sessionIdReducer,
    sessionManager: sessionManagerReducer,
    windowData: windowDataReducer
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
