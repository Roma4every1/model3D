import setChildForms from '../store/actionCreators/setChildForms';
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
        store.dispatch({ type: 'sessionId/set', value: data });
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

        var jsonToSend = { sessionId: store.getState().sessionId, activeParams: paramsArray, children: childArray };
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
        store.dispatch({ type: 'sessionId/set', value: data });
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

    store.dispatch({
        type: 'sessionManager/set', value: {
            paramsManager: paramsManager,
            channelsManager: channelsManager,
            saveSession: saveSession,
            loadSessionByDefault: loadSessionByDefault,
            getSessionLoading: getSessionLoading,
            getChildForms: getChildForms
        }
    });
}