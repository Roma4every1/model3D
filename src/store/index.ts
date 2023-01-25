import thunk from 'redux-thunk';
import { Reducer, Dispatch } from 'redux';
import { WellManagerActionsCreator } from './actions';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { createSessionManager } from '../data-managers/session-manager';

import { appStateReducer, AppStateAction } from './reducers/app-state.reducer';
import { canRunReportReducer, CanRunReportAction } from './reducers/can-run-report.reducer';
import { caratsReducer, CaratsAction } from './reducers/carats.reducer';
import { channelsDataReducer, ChannelsDataAction } from './reducers/channels-data.reducer';
import { channelsLoadingReducer, ChannelsLoadingAction } from './reducers/channels-loading.reducer';
import { childFormsReducer, ChildFormsAction } from './reducers/child-forms.reducer';
import { formRefsReducer, FormRefsAction } from './reducers/form-refs.reducer';
import { formParamsReducer, FormParamsAction } from './reducers/form-params.reducer';
import { formSettingsReducer, FormSettingsAction } from './reducers/form-settings.reducer';
import { formLayoutReducer, FormLayoutAction } from './reducers/form-layout.reducer';
import { layoutReducer, LayoutAction } from './reducers/layout.reducer';
import { mapsReducer, MapsAction } from './reducers/maps.reducer';
import { presentationsReducer, PresentationsAction } from './reducers/presentations.reducer';
import { programsReducer, ProgramsAction } from './reducers/programs.reducer';
import { reportsReducer, ReportsAction } from './reducers/reports.reducer';
import { sessionManagerReducer, SessionManagerAction } from './reducers/session-manager.reducer';
import { windowDataReducer, WindowDataAction } from './reducers/window-data.reducer';


/** Well Manager Action. */
export type WAction = AppStateAction | CanRunReportAction | ChannelsDataAction | ChannelsLoadingAction |
  ChildFormsAction | FormRefsAction | FormParamsAction | FormSettingsAction | FormLayoutAction |
  LayoutAction | MapsAction | PresentationsAction | ProgramsAction | ReportsAction |
  SessionManagerAction | WindowDataAction | CaratsAction;

/** Well Manager Dispatch. */
export type WDispatch = Dispatch<WAction>;


/** Главный обработчик Well Manager Store. */
const rootReducer: Reducer<WState, WAction> = combineReducers({
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
  maps: mapsReducer,
  presentations: presentationsReducer,
  programs: programsReducer,
  reports: reportsReducer,
  sessionManager: sessionManagerReducer,
  windowData: windowDataReducer
});

/** Генератор синхронных действий. */
export const actions = new WellManagerActionsCreator();
/** Well Manager Store. */
export const store = createStore(rootReducer, applyMiddleware(thunk));
/** Менеджер сессии. */
export const sessionManager: SessionManager = createSessionManager(store);
/** Селекторы состояния. */
export { selectors } from './selectors';
