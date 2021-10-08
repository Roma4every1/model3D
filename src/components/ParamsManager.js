import { globals } from './Globals';
var utils = require("../utils");

export default function createParamsManager(store) {

    const loadNeededChannelForParam = async (paramName, formId) => {
        const sessionId = store.getState().sessionId;
        const response = await utils.webFetch(`getNeededChannelForParam?sessionId=${sessionId}&paramName=${paramName}&formId=${formId}`);
        const responseJSON = await response.text();
        return responseJSON;
    }

    const loadGlobalParams = async () => {
        const sessionId = store.getState().sessionId;
        const response = await utils.webFetch(`getFormParameters?sessionId=${sessionId}`);
        const responseJSON = await response.json();
        globals.globalParameters = responseJSON;
        store.dispatch({ type: 'params/set', value: responseJSON });
    }

    const loadFormParameters = async (formId) => {
        const sessionId = store.getState().sessionId;
        const response = await utils.webFetch(`getFormParameters?sessionId=${sessionId}&formId=${formId}`);
        const responseJSON = await response.json();

        if (!globals.presentationParameters) {
            globals.presentationParameters = {}
        }
        var jsonToSet = responseJSON.map(param => { var newParam = param; newParam.formId = formId; return newParam; });
        globals.presentationParameters[formId] = jsonToSet;
        return responseJSON;
    }

    var loaded = false;

    store.subscribe(() => {
        if (store.getState().sessionId && !loaded) {
            loaded = true;
            loadGlobalParams();
        }
    });

    return {
        loadNeededChannelForParam: loadNeededChannelForParam,
        loadFormParameters: loadFormParameters
    };
}