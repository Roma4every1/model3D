import { t } from '../../shared/locales';
import { API } from '../../shared/lib';
import { appAPI } from './app.api';
import { getSessionToSave } from './session-save';
import { clearSession } from '../store/app-state/app.actions';
import { startSession as startSessionThunk } from '../store/root-form/root-form.thunks';
import { clearPresentations } from '../../widgets/presentation';
import { clearForms } from '../../widgets/presentation/store/form.actions';
import { clearParams } from '../../entities/parameters';
import { clearChannels } from '../../entities/channels';
import { clearReports } from '../../entities/reports';
import { clearTables } from '../../features/table/store/table.actions';
import { showWarningMessage } from '../../entities/window';
import { showNotification } from "../../entities/notifications";


/** @return SessionManager */
export function createSessionManager(store) {
  let timerID;

  const extendSession = async () => {
    const res = await appAPI.extendSession();
    if (res.ok && res.data) return;
    clearInterval(timerID);
    store.dispatch(showWarningMessage(t('messages.session-lost')));
  };

  const save = () => {
    return appAPI.saveSession(getSessionToSave(store.getState()));
  };

  const clear = () => {
    store.dispatch(clearPresentations());
    store.dispatch(clearForms());
    store.dispatch(clearTables());
    store.dispatch(clearParams());
    store.dispatch(clearChannels());
    store.dispatch(clearReports());
    store.dispatch(clearSession());
  };

  const startSession = async (isDefault = false) => {
    const state = store.getState();
    if (Object.keys(state.presentations).length > 0) clear();

    const systemName = state.appState.systemID;
    const res = await appAPI.startSession(systemName, isDefault);

    if (res.ok === true) {
      if (timerID) clearInterval(timerID);
      timerID = setInterval(extendSession, 2 * 60 * 1000);
      API.setSessionID(res.data);
    } else {
      store.dispatch(showWarningMessage(res.data));
    }
    return res;
  };

  const saveSession = async () => {
    const res = await save();
    if (res.ok && res.data) {
      showNotification(t('messages.session-save-ok'))(store.dispatch);
    } else {
      store.dispatch(showWarningMessage(t('messages.session-save-error')));
    }
  };

  const loadSessionByDefault = async () => {
    store.dispatch(startSessionThunk(true));
  };

  window.addEventListener('beforeunload', () => { save(); });

  return {
    startSession,
    saveSession,
    loadSessionByDefault,
  };
}
