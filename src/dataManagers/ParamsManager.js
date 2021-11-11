import addParam from "../store/actionCreators/addParam";
import setCanRunReport from "../store/actionCreators/setCanRunReport";
import setParams from "../store/actionCreators/setParams";
import updateParam from "../store/actionCreators/updateParam";
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
                    store.dispatch(addParam(formId, newElement));
                    paramsToUse.push(newElement);
                }
                else {
                    paramsToUse.push(element);
                }
            }
        });
        return paramsToUse;
    }

    const updateParamValue = (formId, paramName, paramValue, manual) => {
        store.dispatch(updateParam(formId, paramName, paramValue, manual));
    }

    var paramChannelNames = [];
    var reportFormId = null;

    const loadNeededChannelForParam = async (paramName, formId) => {
        const sessionId = store.getState().sessionId;
        if (!paramChannelNames[paramName]) {
            const data = await store.getState().sessionManager.fetchData(`getNeededChannelForParam?sessionId=${sessionId}&paramName=${paramName}&formId=${formId}`);
            paramChannelNames[paramName] = data;
        }
        await store.getState().sessionManager.channelsManager.loadAllChannelData(paramChannelNames[paramName], formId, false);
        return paramChannelNames[paramName];
    }

    const loadFormParameters = async (formId, force) => {
        if (force || !store.getState().formParams[formId]) {
            const sessionId = store.getState().sessionId;
            var data = await store.getState().sessionManager.fetchData(`getFormParameters?sessionId=${sessionId}&formId=${formId}`);
            var jsonToSet = data.map(param => { var newParam = param; newParam.formId = formId; return newParam; });
            store.dispatch(setParams(formId, jsonToSet));
            return jsonToSet;
        }
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
    });

    return {
        loadNeededChannelForParam,
        loadFormParameters,
        getParameterValues,
        updateParamValue,
        getCanRunReport
    };
}