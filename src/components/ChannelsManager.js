var utils = require("../utils");

export default function createChannelsManager(store) {

    var chData = [];
    var channelsParams = [];
    var channelsParamsValues = [];

    const getChannelData = (channelName, formId) => {
        if (chData[channelName]) {
            return chData[channelName][formId];
        }
        else {
            return null;
        }
    }

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
    }

    const equalParams = (params1, params2) => {
        if (params1.length !== params2.length) {
            return false;
        }
        for (var i = 0; i < params1.length; i++) {
            if (params1[i] !== params2[i]) {
                return false;
            }
        }
        return true;
    }

    const loadAllChannelData = async (channelName, formId) => {
        const sessionId = store.getState().sessionId;
        if (!channelsParams[channelName]) {
            const channelParamsList = await loadChannelParamsList(channelName);
            channelsParams[channelName] = channelParamsList;
        }
        var neededParamValues = store.getState().sessionManager.paramsManager.getParameterValues(channelsParams[channelName], formId);
        if (!channelsParamsValues[channelName] || !equalParams(channelsParamsValues[channelName], neededParamValues.map(np => np.value))) {
            channelsParamsValues[channelName] = neededParamValues.map(np => np.value);

            const channelData = await loadChannelData(channelName, neededParamValues);
            if (!chData[channelName]) {
                chData[channelName] = [];
            }
            chData[channelName][formId] = channelData;
            store.dispatch({ type: 'sessionId/set', value: sessionId });
        }
    }

    store.subscribe(() => {
        for (var chD in chData) {
            for (var fD in chData[chD]) {
                loadAllChannelData(chD, fD);
            }
        }
    });

    return {
        loadFormChannelsList: loadFormChannelsList,
        loadChannelParamsList: loadChannelParamsList,
        loadChannelData: loadChannelData,
        loadAllChannelData: loadAllChannelData,
        getChannelData: getChannelData
    };
}