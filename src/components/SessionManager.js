import setChildForms from '../store/actionCreators/setChildForms';
import setSessionId from '../store/actionCreators/setSessionId';
import setSessionManager from '../store/actionCreators/setSessionManager';
import createChannelsManager from './ChannelsManager';
import createParamsManager from './ParamsManager';
var utils = require("../utils");

export default function createSessionManager(systemName, store) {
    var sessionLoading = true;

    const startSession = async () => {
        sessionLoading = true;
        const response = await utils.webFetch(`startSession?systemName=${systemName}&defaulConfiguration=false`);
        const data = await response.text();
        sessionLoading = false;
        store.dispatch(setSessionId(data));
    }

    const saveSession = async () => {
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
            layoutArray.push({ id: layout, ...layouts[layout]});
        }

        var jsonToSend = { sessionId: store.getState().sessionId, activeParams: paramsArray, children: childArray, layout: layoutArray };
        const jsonToSendString = JSON.stringify(jsonToSend);
        await utils.webFetch(`saveSession`,
            {
                method: 'POST',
                body: jsonToSendString
            });
    }

    const loadSessionByDefault = async () => {
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

    startSession();

    const paramsManager = createParamsManager(store);
    const channelsManager = createChannelsManager(store);

    const getSessionLoading = () => sessionLoading;

    store.dispatch(setSessionManager({
        paramsManager: paramsManager,
        channelsManager: channelsManager,
        saveSession: saveSession,
        loadSessionByDefault: loadSessionByDefault,
        getSessionLoading: getSessionLoading,
        getChildForms: getChildForms
    }));
}