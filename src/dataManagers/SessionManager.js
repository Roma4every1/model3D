import i18n from '../locales/i18n';
import { webFetch } from "../api/initialization";
import { actions } from "../store";
import { API } from "../api/api";

import createChannelsManager from "./ChannelsManager";
import createParamsManager from "./ParamsManager";
import createPluginsManager from "./PluginsManager";


export default function createSessionManager(store) {
  let sessionLoading = true;
  let timerId;

  const iAmAlive = async () => {
    const { ok, data } = await API.session.iAmAlive(store.getState().sessionId);
    if (!ok || data === 'false') {
      clearInterval(timerId);
      handleWindowWarning(i18n.t('messages.sessionLost'));
    }
  }

  const getSessionLoading = () => sessionLoading;

  const startSession = async (isDefault = false) => {
    sessionLoading = true;
    const systemName = store.getState().appState.systemID;
    if (!systemName) {
      const message = i18n.t('messages.systemNotDefined');
      handleWindowError(message);
      return {ok: false, data: message};
    } else {
      const res = await API.session.startSession(systemName, isDefault);
      if (res.ok === true) {
        sessionLoading = false;
        timerId = setInterval(iAmAlive, 2 * 60 * 1000);

        window.addEventListener('beforeunload', () => {
          clearInterval(timerId);
          stopSession();
        });
        // старое и новое хранилище, потом старое уберётся
        store.dispatch(actions.setSessionId(res.data));
        store.dispatch(actions.setSessionID(res.data));
      }
      return res;
    }
  }

  const loadSessionByDefault = async () => {
    await stopSession(false);
    sessionLoading = true;
    const systemName = store.getState().appState.systemID;
    const data = await fetchData(`startSession?systemName=${systemName}&defaultConfiguration=true`);
    sessionLoading = false;
    store.dispatch(actions.setSessionId(data));
    store.dispatch(actions.setSessionID(data));
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
    for (let form in childForms) childArray.push(childForms[form]);

    const layoutArray = [];
    const layouts = state.formLayout;
    for (let layout in layouts) layoutArray.push({id: layout, ...layouts[layout]});

    const settingsArray = [];
    const settings = state.formSettings;
    for (let setting in settings) settingsArray.push({id: setting, ...settings[setting]});

    return JSON.stringify({
      sessionId: state.sessionId,
      activeParams: paramsArray,
      children: childArray,
      layout: layoutArray,
      settings: settingsArray
    });
  }

  const saveSession = async () => {
    const { ok, data } = await API.session.saveSession(getSavedSession());
    if (!ok || data === 'false') handleWindowWarning(i18n.t('messages.errorOnSessionSave'));
  }

  const saveSessionToFile = async () => {};

  const stopSession = async (clear = true) => {
    const { ok, data } = await API.session.stopSession(getSavedSession());
    if (!ok || data === 'false') return handleWindowWarning(i18n.t('messages.errorOnSessionStop'));
    if (clear) store.dispatch(actions.clearSession());
  }

  const loadSessionFromFile = async (file) => {
    await stopSession();
    sessionLoading = true;
    let reader = new FileReader();

    reader.onload = async function () {
      const data = await fetchData(
        `startSessionFromFile`,
        {method: 'POST', body: reader.result}
      );
      sessionLoading = false;
      store.dispatch(actions.setSessionId(data));
      store.dispatch(actions.setSessionID(data));
    }
    reader.readAsText(file);
  }

  const getChildForms = async (formId) => {
    const sessionId = store.getState().sessionId;
    const data = await fetchData(`getChildrenForms?sessionId=${sessionId}&formId=${formId}`);
    store.dispatch(actions.setChildForms(formId, data));
  }

  const handleWindowError = (text, stackTrace, header, fileToSaveName) => {
    store.dispatch(actions.setWindowError(text, stackTrace, header, fileToSaveName));
  }

  const handleWindowInfo = (text, stackTrace, header, fileToSaveName) => {
    store.dispatch(actions.setWindowInfo(text, stackTrace, header, fileToSaveName));
  }

  const handleWindowWarning = (text, stackTrace, header, fileToSaveName) => {
    store.dispatch(actions.setWindowWarning(text, stackTrace, header, fileToSaveName));
  }

  const handleNotification = (text) => {
    store.dispatch(actions.setWindowNotification(text));
  }

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
      if (result !== true) setTimeout(tick, 5);
    }, 5);
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
  createPluginsManager(store);

  store.dispatch(actions.setSessionManager({
    paramsManager,
    channelsManager,
    startSession,
    stopSession,
    saveSession,
    saveSessionToFile,
    loadSessionByDefault,
    loadSessionFromFile,
    getSessionLoading,
    getChildForms,
    handleWindowError,
    handleWindowInfo,
    handleWindowWarning,
    handleNotification,
    watchReport,
    fetchData,
    getJsonDataWithError
  }));
}
