var utils = require("../utils");

export default function createChannelsManager(store) {

    const loadFormChannelsList = async (formId) => {
        const sessionId = store.getState().sessionId;
        const response = await utils.webFetch(`getChannelsForForm?sessionId=${sessionId}&formId=${formId}`);
        const responseJSON = await response.json();
        return responseJSON;
    }

    const loadChannelParamsList = async (channelName) => {
        const sessionId = store.getState().sessionId;
        const response = await utils.webFetch(`getNeededParamForChannel?sessionId=${sessionId}&channelName=${channelName}`);
        const responseJSON = await response.json();
        return responseJSON;
    }

    const loadChannelData = async (channelName, paramValues) => {
        const sessionId = store.getState().sessionId;
        var jsonToSend = { sessionId: sessionId, channelName: channelName, paramValues: paramValues };
        const jsonToSendString = JSON.stringify(jsonToSend);
        const response = await utils.webFetch(`getChannelDataByName`,
            {
                method: 'POST',
                body: jsonToSendString
            });
        const responseJSON = await response.json();
        return responseJSON;
        //globals.globalParameters = responseJSON;
        //store.dispatch({ type: 'params/set', value: responseJSON });
    }

    const getChannelData = async (channelName, formId) => {
        const channelParamsList = await loadChannelParamsList(channelName);
        var neededParamValues = store.getState().sessionManager.paramsManager.getParameterValues(channelParamsList, formId);
        const channelData = await loadChannelData(channelName, neededParamValues);
        return channelData;
    }

    return {
        loadFormChannelsList: loadFormChannelsList,
        loadChannelParamsList: loadChannelParamsList,
        loadChannelData: loadChannelData,
        getChannelData: getChannelData
    };
}