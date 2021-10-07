import createChannelsManager from './ChannelsManager';
import createParamsManager from './ParamsManager';
import { globals } from './Globals';
var utils = require("../utils");

export default function createSessionManager(systemName, store, callback) {

    async function startSession() {
        const response = await utils.webFetch(`startSession?systemName=${systemName}`);
        const data = await response.text();
        globals.sessionId = data;
        store.dispatch({ type: 'sessionId/set', value: data });
        callback(data);
    }

    startSession();
    const paramsManager = createParamsManager(store);
    const channelsManager = createChannelsManager(store);
    return {
        paramsManager: paramsManager,
        channelsManager: channelsManager
    }
}