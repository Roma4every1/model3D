import thunk from 'redux-thunk';
import { Reducer, combineReducers, createStore, applyMiddleware } from 'redux';
import { createSessionManager } from '../lib/session-manager';

import { appReducer } from './app-state/app.reducer';
import { rootFormReducer } from 'app/store/root-form/root-form.reducer';
import { presentationsReducer } from 'widgets/presentation/store/presentations.reducer';
import { formsReducer } from 'widgets/presentation/store/forms.reducer';
import { tablesReducer } from 'features/table/store/table.reducer';
import { caratsReducer } from 'features/carat/store/carat.reducer';
import { chartsReducer } from 'features/chart/store/chart.reducer';
import { mapsReducer } from 'features/map/store/map.reducer';
import { parametersReducer } from 'entities/parameters/store/parameters.reducer';
import { objectsReducer } from 'entities/objects/store/objects.reducer';
import { channelsReducer } from 'entities/channels/store/channels.reducer';
import { reportsReducer } from 'entities/reports/store/reports.reducer';
import { windowDataReducer } from 'entities/windows/store/window-data.reducer';
import { notificationsReducer } from 'entities/notifications/store/notifications.reducer';
import { fetchStateReducer } from 'entities/fetch-state/store/fetch-state.reducer';


/** Главный обработчик Well Manager Store. */
const rootReducer: Reducer<WState, any> = combineReducers({
  appState: appReducer,
  root: rootFormReducer,
  presentations: presentationsReducer,
  forms: formsReducer,
  parameters: parametersReducer,
  objects: objectsReducer,
  channels: channelsReducer,
  tables: tablesReducer,
  carats: caratsReducer,
  charts: chartsReducer,
  maps: mapsReducer,
  reports: reportsReducer,
  windowData: windowDataReducer,
  notifications: notificationsReducer,
  fetches: fetchStateReducer,
});

/** Well Manager Store. */
export const store = createStore(rootReducer, applyMiddleware(thunk));
/** Менеджер сессии. */
export const sessionManager: SessionManager = createSessionManager(store);
