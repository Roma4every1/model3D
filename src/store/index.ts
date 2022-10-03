import { combineReducers, Dispatch } from "redux";
import { WellManagerActionsCreator } from "./actions";

import { appStateReducer, AppStateAction, AppStateActions } from "./reducers/appState";
import { canRunReportReducer, CanRunReportAction, CanRunReportActions } from "./reducers/canRunReport";
import { channelsDataReducer, ChannelsDataAction, ChannelsDataActions } from "./reducers/channelsData";
import { channelsLoadingReducer, ChannelsLoadingAction, ChannelsLoadingActions } from "./reducers/channelsLoading";
import { childFormsReducer, ChildFormsAction, ChildFormsActions } from "./reducers/childForms";
import { formRefsReducer, FormRefsAction, FormRefsActions } from "./reducers/formRefs";
import { formParamsReducer, FormParamsAction, FormParamsActions } from "./reducers/formParams";
import { formSettingsReducer, FormSettingsAction, FormSettingsActions } from "./reducers/formSettings";
import { layoutReducer, LayoutAction, LayoutActions } from "./reducers/layout";
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
  LayoutActions | MapsActions | PresentationsActions | ProgramsActions | ReportsActions |
  SessionIDActions | SessionManagerActions | WindowDataActions;

/** Well Manager Action. */
export type WAction = AppStateAction | CanRunReportAction | ChannelsDataAction | ChannelsLoadingAction |
  ChildFormsAction | FormRefsAction | FormParamsAction | FormSettingsAction | LayoutAction | MapsAction |
  PresentationsAction | ProgramsAction | ReportsAction | SessionIDAction | SessionManagerAction |
  WindowDataAction;

/** Well Manager Dispatch. */
export type WDispatch = Dispatch<WAction>;


/** Все действия. */
export const actions = new WellManagerActionsCreator();

/** Главный обработчик Well Manager Store. */
export const rootReducer = combineReducers({
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
  presentations: presentationsReducer,
  programs: programsReducer,
  reports: reportsReducer,
  sessionId: sessionIdReducer,
  sessionManager: sessionManagerReducer,
  windowData: windowDataReducer
});

/** Все селекторы. */
export const selectors = {
  config: (state: WState) => state.appState.config.data,
  sessionID: (state: WState) => state.sessionId,
  sessionManager: (state: WState) => state.sessionManager,
  plugins: (state: WState) => state.layout.plugins,
  innerPlugins: (state: WState) => state.layout.plugins.inner,
  stripPlugins: (state: WState) => state.layout.plugins.strip,
  layout: layoutSelector,
  channel: channelSelector,
  formParams: formParamsSelector,
  formChildrenState: formChildrenStateSelector,
  activeChild: activeChildSelector,
  mapsState: (state: WState) => state.maps,
  multiMapState: multiMapStateSelector,
  mapState: mapStateSelector,
  windows: (state: WState) => state.windowData?.windows
}

function layoutSelector(this: FormID, state: WState) {
  return state.layout[this];
}
function channelSelector(this: ChannelName, state: WState) {
  return state.channelsData[this];
}
function formParamsSelector(this: FormID, state: WState) {
  return state.formParams[this];
}
function formChildrenStateSelector(this: FormID, state: WState) {
  return state.childForms[this];
}
function activeChildSelector(this: FormID, state: WState) {
  const formChildrenState = state.childForms[this];
  const activeChildID = formChildrenState?.activeChildren[0];
  return formChildrenState?.children.find(child => child.id === activeChildID);
}
function multiMapStateSelector(this: FormID, state: WState): MultiMapState {
  return state.maps.multi[this];
}
function mapStateSelector(this: FormID, state: WState): MapState {
  return state.maps.single[this];
}
