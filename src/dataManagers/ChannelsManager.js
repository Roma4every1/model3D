import setChannelsData from "../store/actionCreators/setChannelsData";
import i18n from '../i18n';
var _ = require("lodash");

export default function createChannelsManager(store) {

    var allChannelsForms = [];
    var channelsParams = [];
    var channelsParamsValues = [];

    const loadFormChannelsList = async (formId) => {
        const sessionId = store.getState().sessionId;
        const data = await store.getState().sessionManager.fetchData(`getChannelsForForm?sessionId=${sessionId}&formId=${formId}`);
        await Promise.all(data.map(async (channel) => await loadAllChannelData(channel, formId, false)));
        return data;
    }

    const loadChannelParamsList = async (channelName) => {
        const sessionId = store.getState().sessionId;
        const data = await store.getState().sessionManager.fetchData(`getNeededParamForChannel?sessionId=${sessionId}&channelName=${channelName}`);
        return data;
    }

    const loadChannelData = async (channelName, paramValues) => {
        const sessionId = store.getState().sessionId;
        var jsonToSend = { sessionId: sessionId, channelName: channelName, paramValues: paramValues };
        const jsonToSendString = JSON.stringify(jsonToSend);
        const data = await store.getState().sessionManager.fetchData(`getChannelDataByName`,
            {
                method: 'POST',
                body: jsonToSendString
            });
        return data;
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

    const updateTables = async (modifiedTables, baseChannelName) => {
        for (var channelName in allChannelsForms) {
            for (var formId in allChannelsForms[channelName]) {
                if (allChannelsForms[channelName][formId] && store.getState().channelsData[channelName] && modifiedTables?.includes(store.getState().channelsData[channelName].tableId)) {
                    loadAllChannelData(channelName, formId, baseChannelName !== channelName);
                }
            }
        }
    }

    const loadAllChannelData = async (channelName, formId, force) => {
        let channelsExists = true;
        if (!allChannelsForms[channelName]) {
            channelsExists = false;
            allChannelsForms[channelName] = [];
        }
        allChannelsForms[channelName][formId] = true;
        if (!channelsParams[channelName]) {
            const channelParamsList = await loadChannelParamsList(channelName);
            channelsParams[channelName] = channelParamsList ?? [];
        }
        var neededParamValues = store.getState().sessionManager.paramsManager.getParameterValues(channelsParams[channelName], formId, false, channelName);
        var changed = force || !channelsParamsValues[channelName] || !equalParams(channelsParamsValues[channelName], neededParamValues.map(np => np.value));
        if (changed) {
            channelsParamsValues[channelName] = neededParamValues.map(np => np.value);

            const channelData = await loadChannelData(channelName, neededParamValues);
            if (channelData && channelData.data && channelData.data.ModifiedTables && channelData.data.ModifiedTables.ModifiedTables) {
                updateTables(channelData.data.ModifiedTables.ModifiedTables, channelName);
            }
            let idIndex = 0;
            let nameIndex = 0;
            if (channelData && channelData.properties && channelData.data && channelData.data.Columns) {
                channelData.properties.forEach(property => {
                    if (property.name.toUpperCase() === 'LOOKUPCODE') {
                        idIndex = _.findIndex(channelData.data.Columns, (o) => o.Name === property.fromColumn);
                    }
                    else if (property.name.toUpperCase() === 'LOOKUPVALUE') {
                        nameIndex = _.findIndex(channelData.data.Columns, (o) => o.Name === property.fromColumn);
                    }
                });
            }
            if (channelData) {
                channelData.idIndex = idIndex;
                channelData.nameIndex = nameIndex;
            }
            if (channelData && channelData.properties) {
                if (!channelsExists) {
                    await Promise.all(
                        channelData.properties.map(async (property) => {
                            if (property.lookupChannelName) {
                                const lookupChanged = await loadAllChannelData(property.lookupChannelName, formId, false);
                                if (lookupChanged) {
                                    changed = true;
                                }
                                const lookupChannelData = store.getState().channelsData[property.lookupChannelName];
                                if (lookupChannelData && lookupChannelData.data) {
                                    const lookupData = lookupChannelData.data.Rows.map((row) => {
                                        let temp = {};
                                        temp.id = row.Cells[lookupChannelData.idIndex];
                                        temp.value = row.Cells[lookupChannelData.nameIndex] ?? '';
                                        temp.text = row.Cells[lookupChannelData.nameIndex] ?? '';
                                        return temp;
                                    });
                                    property.lookupData = lookupData;
                                }
                            }
                        }));
                }
                else if (store.getState().channelsData[channelName]) {
                    channelData.properties = store.getState().channelsData[channelName].properties;
                }
                store.dispatch(setChannelsData(channelName, channelData));
            }
        }
        return changed;
    }

    const updateTablesByResult = (tableId, operationResult) => {
        if (operationResult) {
            if (!operationResult.WrongResult) {
                updateTables([tableId, ...operationResult?.ModifiedTables?.ModifiedTables]);
            }
            else {
                store.getState().sessionManager.handleWindowError(i18n.t('messages.dataSaveError'));
            }
        }
        else {
            //reject
            updateTables([tableId]);
        }
    }

    const getAllChannelParams = (channelName) => {
        let result = channelsParams[channelName];
        let data = store.getState().channelsData[channelName];
        data.properties.forEach((property) => {
            if (property.lookupChannelName) {
                result = result.concat(channelsParams[property.lookupChannelName]);
            }
        });
        result = _.uniq(result);
        return result;
    }

    const getNewRow = async (tableId) => {
        const sessionId = store.getState().sessionId;
        const data = await store.getState().sessionManager.fetchData(`getNewRow?sessionId=${sessionId}&tableId=${tableId}`);
        return data;
    }

    const insertRow = async (tableId, dataJSON) => {
        const sessionId = store.getState().sessionId;
        const data = await store.getState().sessionManager.fetchData(`insertRow?sessionId=${sessionId}&tableId=${tableId}&rowData=${dataJSON}`);
        updateTablesByResult(tableId, data);
    }

    const updateRow = async (tableId, editID, newRowData) => {
        const sessionId = store.getState().sessionId;
        var jsonToSend = { sessionId: sessionId, tableId: tableId, rowsIndices: editID, newRowData: newRowData };
        const jsonToSendString = JSON.stringify(jsonToSend);
        const data = await store.getState().sessionManager.fetchData(`updateRow`,
            {
                method: 'POST',
                body: jsonToSendString
            });
        updateTablesByResult(tableId, data);
    }

    const deleteRow = async (tableId, elementsToRemove) => {
        const sessionId = store.getState().sessionId;
        const data = await store.getState().sessionManager.fetchData(`removeRows?sessionId=${sessionId}&tableId=${tableId}&rows=${elementsToRemove}`);
        updateTablesByResult(tableId, data);
    }

    const getStatistics = async (tableId, columnName) => {
        const sessionId = store.getState().sessionId;
        const data = await store.getState().sessionManager.fetchData(`getStatistics?sessionId=${sessionId}&tableId=${tableId}&columnName=${columnName}`);
        return data;
    }

    store.subscribe(async () => {
        for (var channelName in allChannelsForms) {
            for (var formId in allChannelsForms[channelName]) {
                if (allChannelsForms[channelName][formId]) {
                    await loadAllChannelData(channelName, formId, false);
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
        deleteRow,
        getStatistics,
        getNewRow,
        getAllChannelParams
    };
}