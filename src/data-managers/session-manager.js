import i18n from '../locales/i18n';
import { actions } from "../store";
import { API } from "../api/api";
import { startSession as startSessionThunk } from "../store/thunks";
import { getSessionToSave } from "../utils/session.utils";

import createChannelsManager from "./channels-manager";
import createParamsManager from "./params-manager";


export function createSessionManager(store) {
  let timerId;

  const iAmAlive = async () => {
    const res = await API.session.iAmAlive();
    if (res.ok && res.data) return;
    clearInterval(timerId);
    store.dispatch(actions.setWindowWarning(i18n.t('messages.sessionLost')));
  };

  const startSession = async (isDefault = false) => {
    const systemName = store.getState().appState.systemID;
    if (!systemName) {
      const message = i18n.t('messages.systemNotDefined');
      store.dispatch(actions.setWindowError(message));
      return {ok: false, data: message};
    } else {
      const res = await API.session.startSession(systemName, isDefault);
      if (res.ok === true) {
        timerId = setInterval(iAmAlive, 2 * 60 * 1000);

        window.addEventListener('beforeunload', () => {
          clearInterval(timerId);
          stopSession();
        });
        const sessionID = res.data;
        // старое и новое хранилище, потом старое уберётся
        store.dispatch(actions.setSessionId(sessionID));
        store.dispatch(actions.setSessionID(sessionID));
        API.setSessionID(sessionID);
      }
      return res;
    }
  };

  const loadSessionByDefault = async () => {
    await stopSession(false);
    store.dispatch(startSessionThunk.bind(true));
  };

  const saveSession = async () => {
    const response = await API.session.saveSession(getSessionToSave(store.getState()));
    if (response.ok && response.data) {
      const clearNotice = () => { store.dispatch(actions.closeWindowNotification()); };
      store.dispatch(actions.setWindowNotification('Сессия сохранена'));
      setTimeout(clearNotice, 3000);
    } else {
      store.dispatch(actions.setWindowWarning(i18n.t('messages.errorOnSessionSave')));
    }
  };

  const stopSession = async (clear = true) => {
    const { ok, data } = await API.session.stopSession(getSessionToSave(store.getState()));
    if (!ok || !data) {
      const message = i18n.t('messages.errorOnSessionStop');
      store.dispatch(actions.setWindowWarning(message)); return;
    }
    if (clear) store.dispatch(actions.clearSession());
  };

  const getReportStatus = async (operationID) => {
    const { ok, data } = await API.programs.getOperationResult(operationID);
    if (ok && data) {
      store.dispatch(actions.setReport(operationID, data.report));
      return data.isReady;
    } else {
      return true;
    }
  };

  const watchReport = (operationID) => {
    setTimeout(async function tick() {
      const result = await getReportStatus(operationID);
      if (result !== true) setTimeout(tick, 1000);
    }, 1000);
  };

  const sessionManager = {
    paramsManager: createParamsManager(store),
    channelsManager: createChannelsManager(store),
    startSession,
    stopSession,
    saveSession,
    loadSessionByDefault,
    watchReport,
  };

  store.dispatch(actions.setSessionManager(sessionManager));
  return sessionManager;
}
