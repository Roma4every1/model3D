import i18n from '../locales/i18n';
import { webFetch } from "../api/initialization";
import { actions } from "../store";
import { API } from "../api/api";
import { startSession as startSessionThunk } from "../store/thunks";

import createChannelsManager from "./channels-manager";
import createParamsManager from "./params-manager";


export default function createSessionManager(store) {
  let timerId;

  const iAmAlive = async () => {
    const response = await API.session.iAmAlive();
    if (response.ok && response.data) return;
    clearInterval(timerId);
    handleWindowWarning(i18n.t('messages.sessionLost'));
  }

  const startSession = async (isDefault = false) => {
    const systemName = store.getState().appState.systemID;
    if (!systemName) {
      const message = i18n.t('messages.systemNotDefined');
      handleWindowError(message);
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
  }

  const loadSessionByDefault = async () => {
    await stopSession(false);
    store.dispatch(startSessionThunk(startSession, true));
  }

  const getSavedSession = () => {
    /** @type WState */
    const state = store.getState();

    const paramsArray = [];
    const formParams = state.formParams;
    for (const formParameter in formParams) {
      paramsArray.push({id: formParameter, value: formParams[formParameter]});
    }

    const childArray = [];
    const childForms = state.childForms;
    const rootFormID = state.appState.rootFormID;
    const multiMapsID = [];

    for (let form in childForms) {
      const formChildren = childForms[form];
      if (formChildren.id === rootFormID) {
        const correctedChildren = [];
        for (const child of formChildren.children) {
          if (child.type === 'multiMap') {
            multiMapsID.push(child.id);
          } else {
            correctedChildren.push(child);
          }
        }
        childArray.push({...formChildren, children: correctedChildren});
      } else {
        if (!multiMapsID.includes(formChildren.id)) childArray.push(formChildren);
      }
    }

    const layoutArray = [];
    const layouts = state.formLayout;
    for (const id in layouts) layoutArray.push({id, ...layouts[id]});

    const settingsArray = [];
    const settings = state.formSettings;
    for (let setting in settings) {
      const formSettings = settings[setting];
      if (formSettings.hasOwnProperty('columns'))
        settingsArray.push({id: setting, ...formSettings});
    }

    const session = {
      sessionId: state.sessionId,
      activeParams: paramsArray,
      children: childArray,
      layout: layoutArray,
      settings: settingsArray
    };
    return JSON.stringify(session);
  }

  const saveSession = async () => {
    const response = await API.session.saveSession(getSavedSession());
    if (response.ok && response.data) {
      const clearNotice = () => { store.dispatch(actions.closeWindowNotification()); };
      store.dispatch(actions.setWindowNotification('Сессия сохранена'));
      setTimeout(clearNotice, 3000);
    } else {
      handleWindowWarning(i18n.t('messages.errorOnSessionSave'));
    }
  }

  const stopSession = async (clear = true) => {
    const { ok, data } = await API.session.stopSession(getSavedSession());
    if (!ok || !data) return handleWindowWarning(i18n.t('messages.errorOnSessionStop'));
    if (clear) store.dispatch(actions.clearSession());
  }

  const loadSessionFromFile = async (file) => {
    await stopSession();
    const reader = new FileReader();

    reader.onload = () => {
      const requestData = {method: 'POST', body: reader.result};
      fetchData(`startSessionFromFile`, requestData).then((data) => {
        store.dispatch(actions.setSessionId(data));
        store.dispatch(actions.setSessionID(data));
      });
    }
    reader.readAsText(file);
  }

  const handleWindowError = (text, stackTrace, header, fileToSaveName) => {
    store.dispatch(actions.setWindowError(text, stackTrace, header, fileToSaveName));
  };

  const handleWindowInfo = (text, stackTrace, header, fileToSaveName) => {
    store.dispatch(actions.setWindowInfo(text, stackTrace, header, fileToSaveName));
  };

  const handleWindowWarning = (text, stackTrace, header, fileToSaveName) => {
    store.dispatch(actions.setWindowWarning(text, stackTrace, header, fileToSaveName));
  };

  const handleNotification = (text) => {
    store.dispatch(actions.setWindowNotification(text));
  };

  const getReportStatus = async (operationId) => {
    try {
      const data = await fetchData(`getOperationResult?sessionId=${store.getState().sessionId}&operationId=${operationId}&waitResult=false`);
      if (data) {
        store.dispatch(actions.setReport(operationId, data.report));
        return data.isReady;
      } else {
        return true;
      }
    } catch {
      return true;
    }
  }

  const watchReport = (operationId) => {
    setTimeout(async function tick() {
      const result = await getReportStatus(operationId);
      if (result !== true) setTimeout(tick, 1000);
    }, 1000);
  }

  const getJsonDataWithError = async (response) => {
    const data = await response.json();

    if (data.error) {
      if (data.type === "Warning") {
        handleWindowWarning(data.message, data.stackTrace);
      } else if (data.type === "Info") {
        handleWindowInfo(data.message, data.stackTrace);
      } else {
        handleWindowError(data.message, data.stackTrace);
      }
      return null;
    }
    return data;
  }

  let fetchBlockedCount = 0;

  const fetchData = async (request, params) => {
    if (fetchBlockedCount < 10) {
      try {
        const response = await webFetch(request, params);
        try {
          return await getJsonDataWithError(response);
        } catch (e) {
          handleWindowError(i18n.t('messages.responseReadError'), e.message + ": " + request);
          fetchBlockedCount++;
          return null;
        }
      } catch (e) {
        //  handleWindowError(e.message, e.stack);
        handleWindowError(i18n.t('messages.serverDisabled'), e.message + ": " + request);
        fetchBlockedCount++;
        return null;
      }
    }
  }

  const paramsManager = createParamsManager(store);
  const channelsManager = createChannelsManager(store);

  store.dispatch(actions.setSessionManager({
    paramsManager,
    channelsManager,
    startSession,
    stopSession,
    saveSession,
    loadSessionByDefault,
    loadSessionFromFile,
    handleWindowError,
    handleWindowInfo,
    handleWindowWarning,
    handleNotification,
    watchReport,
    fetchData,
    getJsonDataWithError
  }));
}
