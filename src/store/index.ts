import thunk from 'redux-thunk';
import { Reducer } from 'redux';
import { WellManagerActionsCreator } from './actions';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { createSessionManager } from '../data-managers/session-manager';

import { appStateReducer } from './reducers/app-state.reducer';
import { canRunReportReducer } from './reducers/can-run-report.reducer';
import { caratsReducer } from './reducers/carats.reducer';
import { channelsDataReducer } from './reducers/channels-data.reducer';
import { channelsLoadingReducer } from './reducers/channels-loading.reducer';
import { childFormsReducer } from './reducers/child-forms.reducer';
import { formRefsReducer } from './reducers/form-refs.reducer';
import { formParamsReducer } from './reducers/form-params.reducer';
import { formSettingsReducer } from './reducers/form-settings.reducer';
import { formLayoutReducer } from './reducers/form-layout.reducer';
import { layoutReducer } from './reducers/layout.reducer';
import { mapsReducer } from './reducers/maps.reducer';
import { presentationsReducer } from './reducers/presentations.reducer';
import { programsReducer } from './reducers/programs.reducer';
import { reportsReducer } from './reducers/reports.reducer';
import { sessionManagerReducer } from './reducers/session-manager.reducer';
import { windowDataReducer } from './reducers/window-data.reducer';


/** Главный обработчик Well Manager Store. */
const rootReducer: Reducer<WState, any> = combineReducers({
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
