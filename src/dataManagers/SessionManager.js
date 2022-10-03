import i18n from '../i18n';
import { webFetch } from "../api/initialization";
import { actions } from "../store";

import createChannelsManager from "./ChannelsManager";
import createParamsManager from "./ParamsManager";
import createPluginsManager from "./PluginsManager";


export default function createSessionManager(store) {
  let sessionLoading = true;
  let timerId;

  const iAmAlive = async () => {
    const data = await fetchData(`iAmAlive?sessionId=${store.getState().sessionId}`);
    if (data === false) {
      clearInterval(timerId);
      handleWindowWarning(i18n.t('messages.sessionLost'));
    }
  }

  const getSessionLoading = () => sessionLoading;

  const startSession = async () => {
    sessionLoading = true;
    const _systemName = store.getState().appState.systemID;
    if (!_systemName) {
      handleWindowError(i18n.t('messages.systemNotDefined'));
      return null;
    } else {
      const data = await fetchData(`startSession?systemName=${_systemName}&defaultConfiguration=false`);
      if (data) {
        sessionLoading = false;
        timerId = setInterval(iAmAlive, 2 * 60 * 1000);

        window.addEventListener("beforeunload", () => {
          clearInterval(timerId);
          stopSession();
        });
        // старое и новое хранилище, потом старое уберётся
        store.dispatch(actions.setSessionId(data));
        store.dispatch(actions.setSessionID(data));
        return data;
      }
    }
  }

  const getSavedSession = async () => {
    const paramsArray = [];
    const formParams = store.getState().formParams;

    for (let formParameter in formParams) {
      paramsArray.push({ id: formParameter, value: formParams[formParameter] });
    }

    const childArray = [];
    const childForms = store.getState().childForms;
    for (let form in childForms) {
      childArray.push(childForms[form]);
    }

    const layoutArray = [];
    const layouts = store.getState().layout;
    for (let layout in layouts) {
      layoutArray.push({ id: layout, ...layouts[layout] });
    }

    const settingsArray = [];
    const settings = store.getState().formSettings;
    for (let setting in settings) {
      settingsArray.push({ id: setting, ...settings[setting] });
    }

    const jsonToSend = {
      sessionId: store.getState().sessionId,
      activeParams: paramsArray,
      children: childArray,
      layout: layoutArray,
      settings: settingsArray
    };
    return JSON.stringify(jsonToSend);
  }

  const saveSession = async () => {
    const data = await fetchData(
      'saveSession',
      {method: 'POST', body: await getSavedSession()}
    );

    if (data === false) {
      handleWindowWarning(i18n.t('messages.errorOnSessionSave'));
    }
  }

  const saveSessionToFile = async () => {};

  const stopSession = async () => {
    const data = await fetchData(
      'stopSession',
      {method: 'POST', body: await getSavedSession()}
    );

    if (data === false) {
      handleWindowWarning(i18n.t('messages.errorOnSessionStop'));
    }
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

  const loadSessionByDefault = async () => {
    await stopSession();
    sessionLoading = true;
    const _systemName = store.getState().appState.systemID;
    const data = await fetchData(`startSession?systemName=${_systemName}&defaultConfiguration=true`);
    sessionLoading = false;
    store.dispatch(actions.setSessionId(data));
    store.dispatch(actions.setSessionID(data));
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
  const pluginsManager = createPluginsManager(store);

  store.dispatch(actions.setSessionManager({
    paramsManager,
    pluginsManager,
    channelsManager,
    startSession,
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
