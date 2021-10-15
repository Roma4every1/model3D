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
        for (var formParameter in paramsManager.formParameters) {
            paramsArray.push({ id: formParameter, value: paramsManager.formParameters[formParameter] });
        }

        var jsonToSend = { sessionId: store.getState().sessionId, activeParams: paramsArray };
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
            getSessionLoading: getSessionLoading
        }
    });
}