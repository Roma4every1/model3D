import setChannelsData from "../store/actionCreators/setChannelsData";
import i18n from '../i18n';
var utils = require("../utils");
var _ = require("lodash");

export default function createChannelsManager(store) {

    var allChannelsForms = [];
    var channelsParams = [];
    var channelsParamsValues = [];

    const loadFormChannelsList = async (formId) => {
        const sessionId = store.getState().sessionId;
        const response = await utils.webFetch(`getChannelsForForm?sessionId=${sessionId}&formId=${formId}`);
        const responseJSON = await response.json();
        await Promise.all(responseJSON.map(async (channel) => await loadAllChannelData(channel, formId, false)));
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

    const setFormInactive = async (inputFormId) => {
        for (var channelName in allChannelsForms) {
            for (var formId in allChannelsForms[channelName]) {
                if (formId === inputFormId) {
                    allChannelsForms[channelName][formId] = false;
                }
            }
        }
    }

    const updateTables = async (modifiedTables) => {
        for (var channelName in allChannelsForms) {
            for (var formId in allChannelsForms[channelName]) {
                if (allChannelsForms[channelName][formId] && store.getState().channelsData[channelName] && modifiedTables?.includes(store.getState().channelsData[channelName].tableId)) {
                    loadAllChannelData(channelName, formId, true);
                }
            }
        }
    }

    const loadAllChannelData = async (channelName, formId, force) => {
        if (!allChannelsForms[channelName]) {
            allChannelsForms[channelName] = [];
        }
        allChannelsForms[channelName][formId] = true;
        if (!channelsParams[channelName]) {
            const channelParamsList = await loadChannelParamsList(channelName);
            channelsParams[channelName] = channelParamsList;
        }
        var neededParamValues = store.getState().sessionManager.paramsManager.getParameterValues(channelsParams[channelName], formId, false);
        var changed = force || !channelsParamsValues[channelName] || !equalParams(channelsParamsValues[channelName], neededParamValues.map(np => np.value));
        if (changed) {
            channelsParamsValues[channelName] = neededParamValues.map(np => np.value);

            const channelData = await loadChannelData(channelName, neededParamValues);
            if (channelData && channelData.data && channelData.data.ModifiedTables && channelData.data.ModifiedTables.ModifiedTables) {
                updateTables(channelData.data.ModifiedTables.ModifiedTables);
            }
            let idIndex = 0;
            let nameIndex = 0;
            if (channelData && channelData.properties) {
                channelData.properties.forEach(property => {
                    if (property.name.toUpperCase() === 'LOOKUPCODE') {
                        idIndex = _.findIndex(channelData.data.Columns, (o) => o.Name === property.fromColumn);
                    }
                    else if (property.name.toUpperCase() === 'LOOKUPVALUE') {
                        nameIndex = _.findIndex(channelData.data.Columns, (o) => o.Name === property.fromColumn);
                    }
                });
            }
            channelData.idIndex = idIndex;
            channelData.nameIndex = nameIndex;
            if (channelData && channelData.data && channelData.data.Columns) {
                await Promise.all(
                    channelData.data.Columns.map(async (column) => {
                        const property = _.find(channelData.properties, function (o) { return o.fromColumn === column.Name; });
                        if (property && property.lookupChannelName) {
                            const lookupChanged = await loadAllChannelData(property.lookupChannelName, formId, false);
                            if (lookupChanged) {
                                changed = true;
                            }
                            const lookupChannelData = store.getState().channelsData[property.lookupChannelName];
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
                store.dispatch(setChannelsData(channelName, channelData));
            }
        }
        return changed;
    }

    const updateTablesByResult = (tableId, operationResult) => {
        if (!operationResult.WrongResult) {
            updateTables([tableId, ...operationResult?.ModifiedTables?.ModifiedTables]);
        }
        else {
            store.getState().sessionManager.handleWindowData(i18n.t('base.error'), i18n.t('messages.dataSaveError'), 'error');
        }
    }

    const insertRow = async (tableId, dataJSON) => {
        const sessionId = store.getState().sessionId;
        const response = await utils.webFetch(`insertRow?sessionId=${sessionId}&tableId=${tableId}&rowData=${dataJSON}`);
        const operationResult = await response.json();
        updateTablesByResult(tableId, operationResult);
    }

    const updateRow = async (tableId, editID, newRowData) => {
        const sessionId = store.getState().sessionId;
        var jsonToSend = { sessionId: sessionId, tableId: tableId, rowsIndices: editID, newRowData: newRowData };
        const jsonToSendString = JSON.stringify(jsonToSend);
        const response = await utils.webFetch(`updateRow`,
            {
                method: 'POST',
                body: jsonToSendString
            });
        const operationResult = await response.json();
        updateTablesByResult(tableId, operationResult);
    }

    const deleteRow = async (tableId, elementsToRemove) => {
        const sessionId = store.getState().sessionId;
        const response = await utils.webFetch(`removeRows?sessionId=${sessionId}&tableId=${tableId}&rows=${elementsToRemove}`);
        const operationResult = await response.json();
        updateTablesByResult(tableId, operationResult);
    }

    store.subscribe(() => {
        for (var channelName in allChannelsForms) {
            for (var formId in allChannelsForms[channelName]) {
                if (allChannelsForms[channelName][formId]) {
                    loadAllChannelData(channelName, formId, false);
                }
            }
        }
    });

    return {
        loadFormChannelsList,
        loadAllChannelData,
        setFormInactive,
        updateTables,
        insertRow,
        updateRow,
        deleteRow
    };
}