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

    const getParameterValues = (neededParamList, formId) => {
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
                paramsToUse.push(element);
            }
        });
        return paramsToUse;
    }

    const updateParam = (formId, paramName, paramValue, manual) => {
        store.dispatch({ type: 'params/update', formId: formId, id: paramName, value: paramValue, manual: manual });
    }

    var paramChannelNames = [];

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

    const loadFormParameters = async (formId) => {
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
        store.dispatch({ type: 'params/set', formId: formId, value: jsonToSet });
    }

    return {
        loadNeededChannelForParam: loadNeededChannelForParam,
        loadFormParameters: loadFormParameters,
        getParameterValues: getParameterValues,
        updateParam: updateParam
    };
}