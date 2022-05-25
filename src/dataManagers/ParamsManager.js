import {find} from "lodash";
import {getParentFormId, tableRowToString, stringToTableCell} from "../utils";

import addParam from "../store/actionCreators/addParam";
import setCanRunReport from "../store/actionCreators/setCanRunReport";
import setFormSettings from "../store/actionCreators/setFormSettings";
import setParams from "../store/actionCreators/setParams";
import updateParam from "../store/actionCreators/updateParam";


export default function createParamsManager(store) {
    const getParameterValues = (neededParamList, formId, addToLocal, channelName) => {
        const paramsToUse = [];
        neededParamList.forEach(paramElement => {
            const param = paramElement.Key ?? paramElement;
            let element = null;
            let currentFormId = formId;
            while (!element || (addToLocal && (currentFormId === getParentFormId(formId)))) {
                element = store.getState().formParams[currentFormId]?.find(o => o.id === param);
                if (currentFormId === '') break;
                currentFormId = getParentFormId(currentFormId);
            }
            if (!element && channelName) {
                element = store.getState().formParams[channelName]?.find(o => o.id === param);
            }
            if (element && element.value !== undefined) {
                if (addToLocal && (element.formId !== formId)) {
                    let localElement = store.getState().formParams[formId]?.find(o => o.id === param);
                    if (localElement) {
                        updateParamValue(formId, param, element.value, false);
                    } else {
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
                } else {
                    paramsToUse.push(element);
                }
            }
        });
        return paramsToUse;
    }

    const oldParamValues = [];
    const paramValuesToSet = [];

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
                        const externalChannelDataRowsConverted = externalChannelDataRows.map(row => tableRowToString(externalChannelData, row));
                        let oldValueInNewRows = find(externalChannelDataRowsConverted, row => String(row.id) === p.value);
                        if (oldValueInNewRows) {
                            paramValuesToSet[formId + '__' + param.id] = null;
                            updateParamValue(formId, param.id, oldValueInNewRows.value, false);
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
                        const externalChannelDataRowsConverted = externalChannelDataRows.map(row => tableRowToString(externalChannelData, row));
                        let dataValue = oldValue ? stringToTableCell(oldValue, 'LOOKUPCODE') : (paramValueToSet ?? stringToTableCell(param.value, 'LOOKUPCODE'));
                        let oldValueInNewRows = find(externalChannelDataRowsConverted, row => String(row.id) === dataValue);
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
                        updateParamValue(formId, param.id, tableRowToString(externalChannelData, externalChannelDataRows[0]).value, true);
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

    let reportFormId = null;

    const loadFormParameters = async (formId, force) => {
        if (force || !store.getState().formParams[formId]) {
            const sessionId = store.getState().sessionId;
            const data = await store.getState().sessionManager.fetchData(`getFormParameters?sessionId=${sessionId}&formId=${formId}`);

            data.forEach((param) => {param.formId = formId});
            store.dispatch(setParams(formId, data));
            data.forEach(async (param) => {
                if (param.externalChannelName && !param.canBeNull) {
                    await store.getState().sessionManager.channelsManager.loadAllChannelData(param.externalChannelName, formId, false);
                }
            });
            return data;
        }
    }

    const loadFormSettings = async (formId) => {
        let data = store.getState().formSettings[formId];
        if (!data) {
            const sessionId = store.getState().sessionId;
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
            const jsonToSend = {sessionId: sessionId, reportId: formId, paramValues: paramValues};
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
            getCanRunReport(reportFormId).then();
        }
        const formParams = store.getState().formParams;
        for (let formId in formParams) {
            for (let param in formParams[formId]) {
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