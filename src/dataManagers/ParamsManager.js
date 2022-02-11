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
        neededParamList.forEach(paramElement => {
            var param = paramElement.Key ?? paramElement;
            var element = null;
            var currentFormId = formId;
            while (!element || (addToLocal && (currentFormId === utils.getParentFormId(formId)))) {
                element = store.getState().formParams[currentFormId]?.find(o => o.id === param);
                if (currentFormId === '') {
                    break;
                }
                currentFormId = utils.getParentFormId(currentFormId);
            }
            if (!element && channelName) {
                element = store.getState().formParams[channelName]?.find(o => o.id === param);
            }
            if (element && element.value !== undefined) {
                if (addToLocal && (element.formId !== formId)) {
                    let localelement = store.getState().formParams[formId]?.find(o => o.id === param);
                    if (localelement)
                    {
                        updateParamValue(formId, param, element.value, false);
                    }
                    else
                    {
                        var newElement = {
                            id: element.id,
                            canBeNull: element.canBeNull,
                            nullDisplayValue: element.nullDisplayValue,
                            showNullValue: element.showNullValue,
                            formIdToLoad: element.formId,
                            formId: formId,
                            value: element.value,
                            dependsOn: element.dependsOn,
                            type: element.type,
                            editorType: paramElement.Value ? null : element.editorType,
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
    var paramValuesToSet = [];

    const updateParamSet = (formId, newParamValues) => {
        const params = store.getState().formParams[formId];
        newParamValues.forEach(p => {
            const param = params.find(pp => pp.id === p.id);
            if (param)
            {
                if (param.externalChannelName)
                {
                    paramValuesToSet[formId + '__' + param.id] = p.value;
                    const externalChannelData = store.getState().channelsData[param.externalChannelName];
                    const externalChannelDataRows = externalChannelData?.data?.Rows;
                    if (externalChannelDataRows && externalChannelDataRows.length > 0) {
                        const externalChannelDataRowsConverted = externalChannelDataRows.map(row => utils.tableRowToString(externalChannelData, row));
                        let oldValueInNewRows = _.find(externalChannelDataRowsConverted, row => String(row.id) === p.value);
                        if (oldValueInNewRows) {
                            paramValuesToSet[formId + '__' + param.id] = null;
                            updateParamValue(formId, param.id, oldValueInNewRows.value, false);
                            return;
                        }
                    }
                }
                else
                {
                    updateParamValue(formId, param.id, p.value, true);
                }
            }
        });
    }

    const setDefaultParamValue = (formId, param) => {
        const externalChannelLoading = store.getState().channelsLoading[param.externalChannelName]?.loading;
        if (param.externalChannelName && !param.canBeNull) {
            if (!externalChannelLoading) {
                let oldValue = oldParamValues[formId + '__' + param.id];
                let paramValueToSet = paramValuesToSet[formId + '__' + param.id];
                oldParamValues[formId + '__' + param.id] = null;
                const externalChannelData = store.getState().channelsData[param.externalChannelName];
                const externalChannelDataRows = externalChannelData?.data?.Rows;

                if (externalChannelDataRows && externalChannelDataRows.length > 0) {
                    if (param.value && (oldValue !== null || paramValueToSet)) {
                        const externalChannelDataRowsConverted = externalChannelDataRows.map(row => utils.tableRowToString(externalChannelData, row));
                        let dataValue = oldValue ? utils.stringToTableCell(oldValue, 'LOOKUPCODE') : (paramValueToSet ?? utils.stringToTableCell(param.value, 'LOOKUPCODE'));
                        let oldValueInNewRows = _.find(externalChannelDataRowsConverted, row => String(row.id) === dataValue);
                        if (oldValueInNewRows) {
                            if (!oldValue && paramValuesToSet[formId + '__' + param.id])
                            {
                                paramValuesToSet[formId + '__' + param.id] = null;
                            }
                            updateParamValue(formId, param.id, oldValueInNewRows.value, false);
                            return;
                        }
                    }
                    if (oldValue !== null || !param.value) {
                        updateParamValue(formId, param.id, utils.tableRowToString(externalChannelData, externalChannelDataRows[0]).value, true);
                    }
                }
                else if (externalChannelData && param.value) {
                    updateParamValue(formId, param.id, null, true);
                }
            }
            else if (externalChannelLoading && !paramValuesToSet[formId + '__' + param.id]) {
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
                if (param.externalChannelName && !param.canBeNull) {
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
        getCanRunReport,
        updateParamSet
    };
}