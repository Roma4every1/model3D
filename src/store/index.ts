import { Reducer, Dispatch, combineReducers } from "redux";
import { WellManagerActionsCreator } from "./actions";

import { appStateReducer, AppStateAction, AppStateActions } from "./reducers/appState";
import { canRunReportReducer, CanRunReportAction, CanRunReportActions } from "./reducers/canRunReport";
import { channelsDataReducer, ChannelsDataAction, ChannelsDataActions } from "./reducers/channelsData";
import { channelsLoadingReducer, ChannelsLoadingAction, ChannelsLoadingActions } from "./reducers/channelsLoading";
import { childFormsReducer, ChildFormsAction, ChildFormsActions } from "./reducers/childForms";
import { formRefsReducer, FormRefsAction, FormRefsActions } from "./reducers/formRefs";
import { formParamsReducer, FormParamsAction, FormParamsActions } from "./reducers/formParams";
import { formSettingsReducer, FormSettingsAction, FormSettingsActions } from "./reducers/formSettings";
import { formLayoutReducer, FormLayoutAction, FormLayoutActions } from "./reducers/formLayout";
import { layoutReducer, LayoutAction, LayoutActions } from "./reducers/layout";
import { chartsReducer, ChartsAction, ChartsActions } from "./reducers/charts";
import { mapsReducer, MapsAction, MapsActions } from "./reducers/maps";
import { presentationsReducer, PresentationsAction, PresentationsActions } from "./reducers/presentations";
import { programsReducer, ProgramsAction, ProgramsActions } from "./reducers/programs";
import { reportsReducer, ReportsAction, ReportsActions } from "./reducers/reports";
import { sessionIdReducer, SessionIDAction, SessionIDActions } from "./reducers/sessionId";
import { sessionManagerReducer, SessionManagerAction, SessionManagerActions } from "./reducers/sessionManager";
import { windowDataReducer, WindowDataAction, WindowDataActions } from "./reducers/windowData";


/** Well Manager Action Type. */
export type WActionType = AppStateActions | CanRunReportActions | ChannelsDataActions |
  ChannelsLoadingActions | ChildFormsActions | FormRefsActions | FormParamsActions | FormSettingsActions |
  FormLayoutActions | LayoutActions | MapsActions | ChartsActions | PresentationsActions | ProgramsActions |
  ReportsActions | SessionIDActions | SessionManagerActions | WindowDataActions;

/** Well Manager Action. */
export type WAction = AppStateAction | CanRunReportAction | ChannelsDataAction | ChannelsLoadingAction |
  ChildFormsAction | FormRefsAction | FormParamsAction | FormSettingsAction | FormLayoutAction | LayoutAction |
  MapsAction | ChartsAction | PresentationsAction | ProgramsAction | ReportsAction |
  SessionIDAction | SessionManagerAction | WindowDataAction;

/** Well Manager Dispatch. */
export type WDispatch = Dispatch<WAction>;


/** Все действия. */
export const actions = new WellManagerActionsCreator();

/** Главный обработчик Well Manager Store. */
export const rootReducer: Reducer<WState, WAction> = combineReducers({
  appState: appStateReducer,
  canRunReport: canRunReportReducer,
  channelsData: channelsDataReducer,
  channelsLoading: channelsLoadingReducer,
  childForms: childFormsReducer,
  formParams: formParamsReducer,
  formRefs: formRefsReducer,
  formSettings: formSettingsReducer,
  formLayout: formLayoutReducer,
  layout: layoutReducer,
  charts: chartsReducer,
  maps: mapsReducer,
  presentations: presentationsReducer,
  programs: programsReducer,
  reports: reportsReducer,
  sessionId: sessionIdReducer,
  sessionManager: sessionManagerReducer,
  windowData: windowDataReducer
});

export { selectors } from "./selectors";
