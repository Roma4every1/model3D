var utils = require("../utils");
var _ = require("lodash");

export default function createChannelsManager(store) {

    var allChannelsData = [];
    var allChannelsForms = [];
    var channelsParams = [];
    var channelsParamsValues = [];

    const getChannelData = (channelName) => {
        if (allChannelsData[channelName] && allChannelsData[channelName]) {
            return allChannelsData[channelName];
        }
        else {
            return null;
        }
    }

    const loadFormChannelsList = async (formId) => {
        const sessionId = store.getState().sessionId;
        const response = await utils.webFetch(`getChannelsForForm?sessionId=${sessionId}&formId=${formId}`);
        const responseJSON = await response.json();
        await Promise.all(responseJSON.map((channel) => loadAllChannelData(channel, formId, false)));
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

    const loadAllChannelData = async (channelName, formId, force) => {
        if (!allChannelsForms[channelName]) {
            allChannelsForms[channelName] = [];
        }
        if (!allChannelsForms[channelName].includes(formId)) {
            allChannelsForms[channelName].push(formId);
        }
        const sessionId = store.getState().sessionId;
        if (!channelsParams[channelName]) {
            const channelParamsList = await loadChannelParamsList(channelName);
            channelsParams[channelName] = channelParamsList;
        }
        var neededParamValues = store.getState().sessionManager.paramsManager.getParameterValues(channelsParams[channelName], formId);
        var changed = force || !channelsParamsValues[channelName] || !equalParams(channelsParamsValues[channelName], neededParamValues.map(np => np.value));
        if (changed) {
            channelsParamsValues[channelName] = neededParamValues.map(np => np.value);

            const channelData = await loadChannelData(channelName, neededParamValues);
            if (!allChannelsData[channelName]) {
                allChannelsData[channelName] = [];
            }
            let idIndex = 0;
            let nameIndex = 0;
            if (channelData && channelData.properties) {
                channelData.properties.forEach(property => {
                    if (property.name.toUpperCase() === 'LOOKUPCODE') {
                        idIndex = _.findIndex(channelData.data.Columns, function (o) { return o.Name === property.fromColumn; });
                    }
                    else if (property.name.toUpperCase() === 'LOOKUPVALUE') {
                        nameIndex = _.findIndex(channelData.data.Columns, function (o) { return o.Name === property.fromColumn; });
                    }
                });
            }
            channelData.idIndex = idIndex;
            channelData.nameIndex = nameIndex;

            allChannelsData[channelName] = channelData;
        }
        if (allChannelsData[channelName] && allChannelsData[channelName].data && allChannelsData[channelName].data.Columns) {
            await Promise.all(
                allChannelsData[channelName].data.Columns.map(async (column) => {
                    const property = _.find(allChannelsData[channelName].properties, function (o) { return o.fromColumn === column.Name; });
                    if (property && property.lookupChannelName) {
                        const lookupChanged = await loadAllChannelData(property.lookupChannelName, formId, false);
                        if (lookupChanged) {
                            changed = true;
                        }
                        const lookupChannelData = allChannelsData[property.lookupChannelName];
                        if (lookupChannelData && lookupChannelData.data) {
                            const lookupData = lookupChannelData.data.Rows.map((row) => {
                                let temp = {};
                                temp.id = row.Cells[lookupChannelData.idIndex];
                                temp.value = row.Cells[lookupChannelData.nameIndex];
                                temp.text = row.Cells[lookupChannelData.nameIndex];
                                return temp;
                            });
                            property.lookupData = lookupData;
                        }
                    }
                }));
        }
        if (changed) {
            store.dispatch({ type: 'sessionId/set', value: sessionId });
        }
        return changed;
    }

    store.subscribe(() => {
        for (var channelName in allChannelsForms) {
            for (var formId in allChannelsForms[channelName]) {
                loadAllChannelData(channelName, allChannelsForms[channelName][formId], false);
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