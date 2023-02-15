import { t } from '../../shared/locales';
import { API } from '../../shared/lib';
import { appAPI } from './app.api';
import { getSessionToSave } from './session-save';
import { clearSession } from '../store/app-state/app.actions';
import { startSession as startSessionThunk } from '../store/root-form/root-form.thunks';
import { clearChannels } from '../../entities/channels';
import { setWindowWarning, showNotice } from '../../entities/windows';


/** @return SessionManager */
export function createSessionManager(store) {
  let timerID;

  const extendSession = async () => {
    const res = await appAPI.extendSession();
    if (res.ok && res.data) return;
    clearInterval(timerID);
    store.dispatch(setWindowWarning(t('messages.session-lost')));
  };

  const startSession = async (isDefault = false) => {
    const systemName = store.getState().appState.systemID;
    const res = await appAPI.startSession(systemName, isDefault);

    if (res.ok === true) {
      if (!timerID) window.addEventListener('beforeunload', stopSession);
      timerID = setInterval(extendSession, 2 * 60 * 1000);
      API.setSessionID(res.data);
    }
    return res;
  };

  const loadSessionByDefault = async () => {
    await stopSession(false);
    store.dispatch(startSessionThunk(true));
  };

  const saveSession = async () => {
    const response = await appAPI.saveSession(getSessionToSave(store.getState()));
    if (response.ok && response.data) {
      showNotice(store.dispatch, t('messages.session-save-ok'));
    } else {
      store.dispatch(setWindowWarning(t('messages.session-save-error')));
    }
  };

  const stopSession = async (clear = true) => {
    const { ok, data } = await appAPI.stopSession(getSessionToSave(store.getState()));
    if (!ok || !data) {
      const message = t('messages.session-stop-error');
      store.dispatch(setWindowWarning(message)); return;
    }
    if (clear) {
      store.dispatch(clearChannels());
      store.dispatch(clearSession());
    }
    if (timerID) clearInterval(timerID);
  };

  return {
    startSession,
    stopSession,
    saveSession,
    loadSessionByDefault,
  };
}
