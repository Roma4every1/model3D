import { t } from 'shared/locales';
import { API, AppDispatch, StateGetter } from 'shared/lib';
import { appAPI } from './app.api';
import { getSessionToSave } from './session-save';
import { showWarningMessage } from 'entities/window';


export async function startNewSession(dispatch: AppDispatch, getState: StateGetter, isDefault: boolean) {
  const state = getState();
  if (Object.keys(state.presentations).length > 0) clearSessionData(state);

  const systemName = state.appState.systemID;
  const res = await appAPI.startSession(systemName, isDefault);

  if (res.ok === true) {
    const intervalID = state.appState.sessionIntervalID;
    if (intervalID !== null) clearInterval(intervalID);

    const extendSession = async () => {
      const res = await appAPI.extendSession();
      if (res.ok && res.data) return;
      const intervalID = getState().appState.sessionIntervalID;
      if (intervalID !== null) clearInterval(intervalID);
      dispatch(showWarningMessage(t('messages.session-lost')));
    };
    state.appState.sessionIntervalID = setInterval(extendSession, 2 * 60 * 1000) as any;
    API.setSessionID(res.data);
  } else {
    dispatch(showWarningMessage(res.data));
  }
  return res;
}

/** Очищает данные текущей сессии, оставляя общие данные приложения. */
function clearSessionData(state: WState): void {
  state.appState.sessionID = null;
  state.parameters = {};
  state.forms = {};
  state.presentations = {};
  state.tables = {};
  state.carats = {};
  state.charts = {};
  state.fileLists = {};
  state.fileViews = {};
  state.maps = {single: {}, multi: {}};
  state.reports = {models: {}, operations: []};
  state.windows = {};
  state.fetches.forms = {};
  state.channels = {};
}

/**
 * Возвращает функцию, которая будет выполнятся при закрытии вкладки
 * или перезагрузке строницы. Происходит сохранение сессии.
 * */
export function getBeforeunloadCallback(getState: StateGetter): () => void {
  return () => { appAPI.stopSession(getSessionToSave(getState())).then(); };
}
