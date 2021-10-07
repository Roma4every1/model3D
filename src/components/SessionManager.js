import createChannelsManager from './ChannelsManager';
import createParamsManager from './ParamsManager';
import { globals } from './Globals';
var utils = require("../utils");

export default function createSessionManager(systemName, store, callback) {

    async function startSession() {
        const response = await utils.webFetch(`startSession?systemName=${systemName}`);
        const data = await response.text();
        globals.sessionId = data;
        createParamsManager(data, store);
        callback(data);
    }

    startSession();
    createChannelsManager();
}