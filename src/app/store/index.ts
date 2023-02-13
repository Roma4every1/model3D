import thunk from 'redux-thunk';
import { Reducer } from 'redux';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { createSessionManager } from '../session/session-manager';

import { appReducer } from './app-state/app.reducer';
import { rootFormReducer } from 'widgets/root-form/store/root-form.reducer';
import { presentationsReducer } from 'widgets/presentation/store/presentations.reducer';
import { formsReducer } from 'widgets/form/store/forms.reducer';
import { parametersReducer } from 'entities/parameters/store/parameters.reducer';
import { channelsReducer } from 'entities/channels/store/channels.reducer';
import { datasetsReducer } from 'features/dataset/store/datasets.reducer';
// import { caratsReducer } from 'features/carat/store/carats.reducer';
import { mapsReducer } from 'features/map/store/maps.reducer';
import { reportsReducer } from 'entities/reports/store/reports.reducer';
import { windowDataReducer } from 'entities/windows/store/window-data.reducer';
import { fetchStateReducer } from 'entities/fetch-state/store/fetch-state.reducer';


/** Главный обработчик Well Manager Store. */
const rootReducer: Reducer<WState, any> = combineReducers({
  appState: appReducer,
  root: rootFormReducer,
  presentations: presentationsReducer,
  forms: formsReducer,
  parameters: parametersReducer,
  channels: channelsReducer,
  dataSets: datasetsReducer,
  // carats: caratsReducer,
  maps: mapsReducer,
  reports: reportsReducer,
  windowData: windowDataReducer,
  fetches: fetchStateReducer,
});

/** Well Manager Store. */
export const store = createStore(rootReducer, applyMiddleware(thunk));
/** Менеджер сессии. */
export const sessionManager: SessionManager = createSessionManager(store);
