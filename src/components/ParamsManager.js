import { globals } from './Globals';
var utils = require("../utils");

export default function createParamsManager(store) {

    const loadNeededChannelForParam = async (paramName, formId) => {
        const sessionId = store.getState().sessionId;
        const response = await utils.webFetch(`getNeededChannelForParam?sessionId=${sessionId}&paramName=${paramName}&formId=${formId}`);
        const responseJSON = await response.text();
        return responseJSON;
    }

    async function loadGlobalParams() {
        const sessionId = store.getState().sessionId;
        const response = await utils.webFetch(`getGlobalParameters?sessionId=${sessionId}`);
        const responseJSON = await response.json();
        globals.globalParameters = responseJSON;
        store.dispatch({ type: 'params/set', value: responseJSON });
    }

    var loaded = false;

    store.subscribe(() => {
        if (store.getState().sessionId && !loaded) {
            loaded = true;
            loadGlobalParams();
        }
    });

    return {
        loadNeededChannelForParam: loadNeededChannelForParam
    };
}