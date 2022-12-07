import { Reducer, Dispatch, combineReducers } from "redux";
import { WellManagerActionsCreator } from "./actions";

import { appStateReducer, AppStateAction, AppStateActions } from "./reducers/app-state.reducer";
import { canRunReportReducer, CanRunReportAction, CanRunReportActions } from "./reducers/can-run-report.reducer";
import { caratsReducer, CaratsAction, CaratsActions } from "./reducers/carats.reducer";
import { channelsDataReducer, ChannelsDataAction, ChannelsDataActions } from "./reducers/channels-data.reducer";
import { channelsLoadingReducer, ChannelsLoadingAction, ChannelsLoadingActions } from "./reducers/channels-loading.reducer";
import { childFormsReducer, ChildFormsAction, ChildFormsActions } from "./reducers/child-forms.reducer";
import { formRefsReducer, FormRefsAction, FormRefsActions } from "./reducers/form-refs.reducer";
import { formParamsReducer, FormParamsAction, FormParamsActions } from "./reducers/form-params.reducer";
import { formSettingsReducer, FormSettingsAction, FormSettingsActions } from "./reducers/form-settings.reducer";
import { formLayoutReducer, FormLayoutAction, FormLayoutActions } from "./reducers/form-layout.reducer";
import { layoutReducer, LayoutAction, LayoutActions } from "./reducers/layout.reducer";
import { chartsReducer, ChartsAction, ChartsActions } from "./reducers/charts.reducer";
import { mapsReducer, MapsAction, MapsActions } from "./reducers/maps.reducer";
import { presentationsReducer, PresentationsAction, PresentationsActions } from "./reducers/presentations.reducer";
import { programsReducer, ProgramsAction, ProgramsActions } from "./reducers/programs.reducer";
import { reportsReducer, ReportsAction, ReportsActions } from "./reducers/reports.reducer";
import { sessionIdReducer, SessionIDAction, SessionIDActions } from "./reducers/session-id.reducer";
import { sessionManagerReducer, SessionManagerAction, SessionManagerActions } from "./reducers/session-manager.reducer";
import { windowDataReducer, WindowDataAction, WindowDataActions } from "./reducers/window-data.reducer";


/** Well Manager Action Type. */
export type WActionType = AppStateActions | CanRunReportActions | ChannelsDataActions |
  ChannelsLoadingActions | ChildFormsActions | FormRefsActions | FormParamsActions | FormSettingsActions |
  FormLayoutActions | LayoutActions | MapsActions | ChartsActions | PresentationsActions | ProgramsActions |
  ReportsActions | SessionIDActions | SessionManagerActions | WindowDataActions | CaratsActions;

/** Well Manager Action. */
export type WAction = AppStateAction | CanRunReportAction | ChannelsDataAction | ChannelsLoadingAction |
  ChildFormsAction | FormRefsAction | FormParamsAction | FormSettingsAction | FormLayoutAction | LayoutAction |
  MapsAction | ChartsAction | PresentationsAction | ProgramsAction | ReportsAction |
  SessionIDAction | SessionManagerAction | WindowDataAction | CaratsAction;

/** Well Manager Dispatch. */
export type WDispatch = Dispatch<WAction>;


/** Все действия. */
export const actions = new WellManagerActionsCreator();

/** Главный обработчик Well Manager Store. */
export const rootReducer: Reducer<WState, WAction> = combineReducers({
  appState: appStateReducer,
  canRunReport: canRunReportReducer,
  carats: caratsReducer,
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
