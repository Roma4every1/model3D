import { combineReducers } from "redux";

import { canRunReport } from "./reducers/canRunReport";
import { channelsData } from "./reducers/channelsData";
import { channelsLoading } from "./reducers/channelsLoading";
import { childForms } from "./reducers/childForms";
import { formRefs } from "./reducers/formRefs";
import { formParams } from "./reducers/formParams";
import { formSettings } from "./reducers/formSettings";
import { formStates } from "./reducers/formStates";
import { layout } from "./reducers/layout";
import { plugins } from "./reducers/plugins";
import { reports } from "./reducers/reports";
import { sessionId } from "./reducers/sessionId";
import { sessionManager } from "./reducers/sessionManager";
import { windowData } from "./reducers/windowData";


const rootReducer = combineReducers({
    canRunReport,
    channelsData, channelsLoading,
    childForms,
    formParams, formRefs, formSettings, formStates,
    layout,
    plugins,
    reports,
    sessionId, sessionManager,
    windowData
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
