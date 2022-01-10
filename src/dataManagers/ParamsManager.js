import addParam from "../store/actionCreators/addParam";
import setCanRunReport from "../store/actionCreators/setCanRunReport";
import setFormSettings from "../store/actionCreators/setFormSettings";
import setParams from "../store/actionCreators/setParams";
import updateParam from "../store/actionCreators/updateParam";
var utils = require("../utils");
var _ = require("lodash");

export default function createParamsManager(store) {

    const getParameterValues = (neededParamList, formId, addToLocal, channelName) => {
        var paramsToUse = [];
        neededParamList.forEach(param => {
            var element = null;
            var currentFormId = formId;
            while (!element || (addToLocal && (currentFormId === utils.getParentFormId(formId)))) {
                element = _.find(store.getState().formParams[currentFormId], function (o) { return o.id === param; });
                if (currentFormId === '') {
                    break;
                }
                currentFormId = utils.getParentFormId(currentFormId);
            }
            if (!element && channelName) {
                element = _.find(store.getState().formParams[channelName], function (o) { return o.id === param; });
            }
            if (element && element.value !== undefined) {
                if (addToLocal && (element.formId !== formId)) {
                    let localelement = _.find(store.getState().formParams[formId], function (o) { return o.id === param; });
                    if (localelement)
                    {
                        updateParamValue (formId, param, element.value, true);                        
                    }
                    else
                    {
                        var newElement = {
                            id: element.id,
                            canBeNull: element.canBeNull,
                            formIdToLoad: element.formId,
                            formId: formId,
                            value: element.value,
                            dependsOn: element.dependsOn,
                            type: element.type,
                            editorType: element.editorType,
                            editorDisplayOrder: element.editorDisplayOrder,
                            externalChannelName: element.externalChannelName,
                            displayName: element.displayName
                        }
                        store.dispatch(addParam(formId, newElement));
                    }
                    paramsToUse.push(newElement);
                }
                else {
                    paramsToUse.push(element);
                }
            }
        });
        return paramsToUse;
    }

    var oldParamValues = [];

    const setDefaultParamValue = (formId, param) => {
        const externalChannelLoading = store.getState().channelsLoading[param.externalChannelName]?.loading;
        if (param.externalChannelName && !param.canBeNull) {
            if (!externalChannelLoading && oldParamValues[formId + '__' + param.id] !== null) {
                let oldValue = oldParamValues[formId + '__' + param.id];
                oldParamValues[formId + '__' + param.id] = null;
                const externalChannelData = store.getState().channelsData[param.externalChannelName];
                const externalChannelDataRows = externalChannelData?.data?.Rows;

                if (externalChannelDataRows && externalChannelDataRows.length > 0) {
                    if (param.value) {
                        const externalChannelDataRowsConverted = externalChannelDataRows.map(row => utils.tableRowToString(externalChannelData, row));
                        let dataValue = utils.stringToTableRowId(oldValue);
                        let oldValueInNewRows = _.find(externalChannelDataRowsConverted, row => String(row.id) === dataValue);
                        if (oldValueInNewRows) {
                            if (oldValueInNewRows.value !== oldValue) {
                                updateParamValue(formId, param.id, oldValueInNewRows.value, true);
                            }
                            return;
                        }
                    }
                    updateParamValue(formId, param.id, utils.tableRowToString(externalChannelData, externalChannelDataRows[0]).value, true);
                }
            }
            else if (externalChannelLoading) {
                oldParamValues[formId + '__' + param.id] = param.value ?? undefined;
            }
        }
    }

    const updateParamValue = (formId, paramName, paramValue, manual) => {
        store.dispatch(updateParam(formId, paramName, paramValue, manual));
    }

    var reportFormId = null;

    const loadFormParameters = async (formId, force) => {
        if (force || !store.getState().formParams[formId]) {
            const sessionId = store.getState().sessionId;
            var data = await store.getState().sessionManager.fetchData(`getFormParameters?sessionId=${sessionId}&formId=${formId}`);
            var jsonToSet = data.map(param => { var newParam = param; newParam.formId = formId; return newParam; });
            store.dispatch(setParams(formId, jsonToSet));
            data.forEach(async (param) => {
                if (param.externalChannelName) {
                    store.getState().sessionManager.channelsManager.loadAllChannelData(param.externalChannelName, formId, false);
                }
            });
            return jsonToSet;
        }
    }

    const loadFormSettings = async (formId) => {
        const sessionId = store.getState().sessionId;
        var data = store.getState().formSettings[formId];
        if (!data)
        {
            data = await store.getState().sessionManager.fetchData(`getFormSettings?sessionId=${sessionId}&formId=${formId}`);
            store.dispatch(setFormSettings(formId, data));
        }
        return data;
    }

    const getCanRunReport = async (formId) => {
        const canRunReport = store.getState().canRunReport;
        reportFormId = formId;
        if (formId != null) {
            const paramValues = store.getState().formParams[formId];
            const sessionId = store.getState().sessionId;
            var jsonToSend = { sessionId: sessionId, reportId: formId, paramValues: paramValues };
            const jsonToSendString = JSON.stringify(jsonToSend);
            const data = await store.getState().sessionManager.fetchData(`canRunReport`,
                {
                    method: 'POST',
                    body: jsonToSendString
                });
            if (canRunReport !== data) {
                store.dispatch(setCanRunReport(data));
            }
        }
        else if (canRunReport) {
            store.dispatch(setCanRunReport(false));
        }
    }

    store.subscribe(() => {
        if (reportFormId) {
            getCanRunReport(reportFormId);
        }
        const formParams = store.getState().formParams;
        for (var formId in formParams) {
            for (var param in formParams[formId]) {
                setDefaultParamValue(formId, formParams[formId][param]);
            }
        }
    });

    return {
        loadFormParameters,
        loadFormSettings,
        getParameterValues,
        updateParamValue,
        getCanRunReport
    };
}