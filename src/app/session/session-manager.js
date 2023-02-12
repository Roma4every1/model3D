import { t } from '../../shared/locales';
import { API } from '../../shared/lib';
import { sessionAPI } from './session.api';
import { getSessionToSave } from './session.utils';
import { clearSession } from '../store/app-state/app.actions';
import { startSession as startSessionThunk} from '../../widgets/root-form/store/root-form.thunks';
import { clearChannels } from '../../entities/channels';
import { closeWindowNotification, setWindowError, setWindowNotification, setWindowWarning } from '../../entities/windows';


/** @return SessionManager */
export function createSessionManager(store) {
  let timerID;

  const iAmAlive = async () => {
    const res = await sessionAPI.iAmAlive();
    if (res.ok && res.data) return;
    clearInterval(timerID);
    store.dispatch(setWindowWarning(t('messages.session-lost')));
  };

  const startSession = async (isDefault = false) => {
    const systemName = store.getState().appState.systemID;
    if (!systemName) {
      const message = t('messages.system-not-defined');
      store.dispatch(setWindowError(message));
      return {ok: false, data: message};
    } else {
      const res = await sessionAPI.startSession(systemName, isDefault);
      if (res.ok === true) {
        timerID = setInterval(iAmAlive, 2 * 60 * 1000);

        window.addEventListener('beforeunload', () => {
          clearInterval(timerID);
          stopSession();
        });
        API.setSessionID(res.data);
      }
      return res;
    }
  };

  const loadSessionByDefault = async () => {
    await stopSession(false);
    store.dispatch(startSessionThunk(true));
  };

  const saveSession = async () => {
    const response = await sessionAPI.saveSession(getSessionToSave(store.getState()));
    if (response.ok && response.data) {
      const clearNotice = () => { store.dispatch(closeWindowNotification()); };
      store.dispatch(setWindowNotification('Сессия сохранена'));
      setTimeout(clearNotice, 3000);
    } else {
      store.dispatch(setWindowWarning(t('messages.session-save-error')));
    }
  };

  const stopSession = async (clear = true) => {
    const { ok, data } = await sessionAPI.stopSession(getSessionToSave(store.getState()));
    if (!ok || !data) {
      const message = t('messages.session-stop-error');
      store.dispatch(setWindowWarning(message)); return;
    }
    if (clear) {
      store.dispatch(clearChannels());
      store.dispatch(clearSession());
    }
  };

  return {
    startSession,
    stopSession,
    saveSession,
    loadSessionByDefault,
  };
}
