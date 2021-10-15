var utils = require("../utils");
var _ = require("lodash");

export default function createParamsManager(store) {

    const getParentFormId = (formId) => {
        var index1 = formId.lastIndexOf(':');
        var index2 = formId.lastIndexOf(',');
        var index = index1;
        if (index === -1 || index2 > index1) {
            index = index2;
        }
        if (index === -1) {
            return ''
        }
        else {
            return formId.substring(0, index);
        }
    }

    const getParameterValues = (neededParamList, formId, addToLocal) => {
        var paramsToUse = [];
        neededParamList.forEach(param => {
            var element = null;
            var currentFormId = formId;
            while (!element) {
                element = _.find(store.getState().formParams[currentFormId], function (o) { return o.id === param; });
                if (currentFormId === '') {
                    break;
                }
                currentFormId = getParentFormId(currentFormId);
            }
            if (element) {
                if (addToLocal && (element.formId !== formId)) {
                    var newElement = {
                        id: element.id,
                        formIdToLoad: element.formId,
                        formId: formId,
                        value: element.value,
                        dependsOn: element.dependsOn,
                        type: element.type,
                        editorType: element.editorType,
                        displayName: element.displayName
                    }
                    store.dispatch({ type: 'params/add', formId: formId, parameter: newElement });
                    paramsToUse.push(newElement);
                }
                else {
                    paramsToUse.push(element);
                }
            }
        });
        return paramsToUse;
    }

    const updateParam = (formId, paramName, paramValue, manual) => {
        store.dispatch({ type: 'params/update', formId: formId, id: paramName, value: paramValue, manual: manual });
    }

    var paramChannelNames = [];
    var formParameters = [];
    var reportFormId = null;

    const loadNeededChannelForParam = async (paramName, formId) => {
        const sessionId = store.getState().sessionId;
        if (!paramChannelNames[paramName]) {
            const response = await utils.webFetch(`getNeededChannelForParam?sessionId=${sessionId}&paramName=${paramName}&formId=${formId}`);
            const channelName = await response.text();
            paramChannelNames[paramName] = channelName;
        }
        await store.getState().sessionManager.channelsManager.loadAllChannelData(paramChannelNames[paramName], formId, false);
        return paramChannelNames[paramName];
    }

    const loadFormParameters = async (formId, force) => {
        if (force || !formParameters[formId]) {
            const sessionId = store.getState().sessionId;
            var response;
            if (formId) {
                response = await utils.webFetch(`getFormParameters?sessionId=${sessionId}&formId=${formId}`);
            }
            else {
                response = await utils.webFetch(`getFormParameters?sessionId=${sessionId}`);
            }
            const responseJSON = await response.json();
            var jsonToSet = responseJSON.map(param => { var newParam = param; newParam.formId = formId; return newParam; });
            formParameters[formId] = jsonToSet;
            store.dispatch({ type: 'params/set', formId: formId, value: jsonToSet, force: force });
        }
    }

    const getCanRunReport = async (formId) => {
        reportFormId = formId;
        if (formId != null) {
            const paramValues = store.getState().formParams[formId];
            const sessionId = store.getState().sessionId;
            var jsonToSend = { sessionId: sessionId, reportId: formId, paramValues: paramValues };
            const jsonToSendString = JSON.stringify(jsonToSend);
            const response = await utils.webFetch(`canRunReport`,
                {
                    method: 'POST',
                    body: jsonToSendString
                });
            const responsetext = await response.text();
            const canRunReport = (responsetext === 'True') ? true : false;
            store.dispatch({ type: 'canRunReport/set', value: canRunReport });
        }
        else {
            store.dispatch({ type: 'canRunReport/set', value: false });
        }
    }

    store.subscribe(() => {
        if (reportFormId) {
            getCanRunReport(reportFormId);
        }
    });


    return {
        loadNeededChannelForParam: loadNeededChannelForParam,
        loadFormParameters: loadFormParameters,
        getParameterValues: getParameterValues,
        updateParam: updateParam,
        getCanRunReport: getCanRunReport,
        formParameters: formParameters
    };
}