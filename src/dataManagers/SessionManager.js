import setChildForms from '../store/actionCreators/setChildForms';
import setSessionId from '../store/actionCreators/setSessionId';
import setSessionManager from '../store/actionCreators/setSessionManager';
import createChannelsManager from './ChannelsManager';
import createParamsManager from './ParamsManager';
import createPluginsManager from './PluginsManager';
import setWindowData from "../store/actionCreators/setWindowData";
import i18n from '../i18n';
var utils = require("../utils");

export default function createSessionManager(systemName, store) {
    var sessionLoading = true;
    let timerId;

    async function iAmAlive() {
        var response = await utils.webFetch(`iAmAlive?sessionId=${store.getState().sessionId}`);
        var data = await response.text();
        if (data === "false") {
            clearInterval(timerId);
            handleWindowData(i18n.t('base.warning'), i18n.t('messages.sessionLost'), 'warning');
        }
    }

    const startSession = async () => {
        sessionLoading = true;
        const response = await utils.webFetch(`startSession?systemName=${systemName}&defaulConfiguration=false`);
        const data = await response.text();
        sessionLoading = false;
        timerId = setInterval(iAmAlive, 2  * 60 * 1000);
        store.dispatch(setSessionId(data));
        window.addEventListener("beforeunload", () => {
            clearInterval(timerId);
            stopSession();
        });
    }

    const getSavedSession = async () => {
        var paramsArray = [];
        const formParams = store.getState().formParams;
        for (var formParameter in formParams) {
            paramsArray.push({ id: formParameter, value: formParams[formParameter] });
        }

        var childArray = [];
        const childForms = store.getState().childForms;
        for (var form in childForms) {
            childArray.push(childForms[form]);
        }

        var layoutArray = [];
        const layouts = store.getState().layout;
        for (var layout in layouts) {
            layoutArray.push({ id: layout, ...layouts[layout] });
        }

        var jsonToSend = { sessionId: store.getState().sessionId, activeParams: paramsArray, children: childArray, layout: layoutArray };
        return JSON.stringify(jsonToSend);
    }

    const saveSession = async () => {
        var response = await utils.webFetch(`saveSession`,
            {
                method: 'POST',
                body: await getSavedSession()
            });
        var data = await response.text();
        if (data === "false") {
            handleWindowData(i18n.t('base.warning'), i18n.t('messages.errorOnSessionSave'), 'warning');
        }
    }

    const saveSessionToFile = async () => {
    }

    const stopSession = async () => {
        var response = await utils.webFetch(`stopSession`,
            {
                method: 'POST',
                body: await getSavedSession()
            });
        var data = await response.text();
        if (data === "false") {
            handleWindowData(i18n.t('base.warning'), i18n.t('messages.errorOnSessionStop'), 'warning');
        }
    }

    const loadSessionFromFile = async (file) => {
        stopSession();
        sessionLoading = true;
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = async function () {
            const response = await utils.webFetch(`startSessionFromFile`,
                {
                    method: 'POST',
                    body: reader.result
                });
            const data = await response.text();
            sessionLoading = false;
            store.dispatch(setSessionId(data));
        }
    }

    const loadSessionByDefault = async () => {
        stopSession();
        sessionLoading = true;
        const response = await utils.webFetch(`startSession?systemName=${systemName}&defaulConfiguration=true`);
        const data = await response.text();
        sessionLoading = false;
        store.dispatch(setSessionId(data));
    }

    const getChildForms = async (formId) => {
        const sessionId = store.getState().sessionId;
        const response = await utils.webFetch(`getChildrenForms?sessionId=${sessionId}&formId=${formId}`);
        const data = await response.json();
        store.dispatch(setChildForms(formId, data));
    }

    const handleWindowData = (header, text, windowType) => {
        store.dispatch(setWindowData(header, text, windowType));
    }

    startSession();

    const paramsManager = createParamsManager(store);
    const channelsManager = createChannelsManager(store);
    const pluginsManager = createPluginsManager(store);

    const getSessionLoading = () => sessionLoading;

    store.dispatch(setSessionManager({
        paramsManager,
        pluginsManager,
        channelsManager,
        saveSession,
        saveSessionToFile,
        loadSessionByDefault,
        loadSessionFromFile,
        getSessionLoading,
        getChildForms,
        handleWindowData
    }));
}