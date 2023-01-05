import { find } from "lodash";
import { getParentFormId, tableRowToString, stringToTableCell } from "../utils/utils";
import { actions } from "../store";
import { API } from "../api/api";


export default function createParamsManager(store) {
  const oldParamValues = {};
  const paramValuesToSet = {};
  let reportFormID = null;

  const getParameterValues = (neededParamList, formID, addToLocal, channelName) => {
    const paramsToUse = [];
    neededParamList.forEach(paramElement => {
      const param = paramElement.Key ?? paramElement;
      let element = null;
      let currentFormId = formID;
      while (!element || (addToLocal && (currentFormId === getParentFormId(formID)))) {
        element = store.getState().formParams[currentFormId]?.find(o => o.id === param);
        if (currentFormId === '') break;
        currentFormId = getParentFormId(currentFormId);
      }
      if (!element && channelName) {
        element = store.getState().formParams[channelName]?.find(o => o.id === param);
      }
      if (element && element.value !== undefined) {
        if (addToLocal && (element.formId !== formID)) {
          let localElement = store.getState().formParams[formID]?.find(o => o.id === param);
          if (localElement) {
            updateParamValue(formID, param, element.value, false);
          } else {
            var newElement = {
              id: element.id,
              canBeNull: element.canBeNull,
              nullDisplayValue: element.nullDisplayValue,
              showNullValue: element.showNullValue,
              formIdToLoad: element.formId,
              formId: formID,
              value: element.value,
              dependsOn: element.dependsOn,
              type: element.type,
              editorType: paramElement.Value ? null : element.editorType,
              editorDisplayOrder: element.editorDisplayOrder,
              externalChannelName: element.externalChannelName,
              displayName: element.displayName
            }
            store.dispatch(actions.addParam(formID, newElement));
          }
          paramsToUse.push(newElement);
        } else {
          paramsToUse.push(element);
        }
      }
    });
    return paramsToUse;
  }

  /** Позволяет обновить сразу несколько параметров.
   *
   * Используется только при работе с картами (ProgramParametersList.js).
   * */
  const updateParamSet = (formID, newParamValues) => {
    const params = store.getState().formParams[formID];
    newParamValues.forEach(p => {
      const param = params.find(pp => pp.id === p.id);
      if (param) {
        if (param.externalChannelName) {
          paramValuesToSet[formID + '__' + param.id] = p.value;
          const externalChannelData = store.getState().channelsData[param.externalChannelName];
          const externalChannelDataRows = externalChannelData?.data?.Rows;
          if (externalChannelDataRows && externalChannelDataRows.length > 0) {
            const externalChannelDataRowsConverted = externalChannelDataRows.map(row => tableRowToString(externalChannelData, row));
            let oldValueInNewRows = find(externalChannelDataRowsConverted, row => String(row.id) === p.value);
            if (oldValueInNewRows) {
              paramValuesToSet[formID + '__' + param.id] = null;
              updateParamValue(formID, param.id, oldValueInNewRows.value, false);
            }
          }
        } else {
          updateParamValue(formID, param.id, p.value, true);
        }
      }
    });
  }

  const setDefaultParamValue = (formID, param) => {
    if (!param.externalChannelName || param.canBeNull) return;
    const externalChannelLoading = store.getState().channelsLoading[param.externalChannelName]?.loading;

    if (externalChannelLoading && !paramValuesToSet[formID + '__' + param.id]) {
      oldParamValues[formID + '__' + param.id] = param.value ?? undefined;
      return;
    }
    if (externalChannelLoading) return;

    let oldValue = oldParamValues[formID + '__' + param.id];
    let paramValueToSet = paramValuesToSet[formID + '__' + param.id];
    oldParamValues[formID + '__' + param.id] = null;

    const externalChannelData = store.getState().channelsData[param.externalChannelName];
    const externalChannelDataRows = externalChannelData?.data?.Rows;

    if (externalChannelDataRows && externalChannelDataRows.length > 0) {
      if (param.value && (oldValue !== null || paramValueToSet)) {
        const externalChannelDataRowsConverted = externalChannelDataRows.map(row => tableRowToString(externalChannelData, row));
        let dataValue = oldValue ? stringToTableCell(oldValue, 'LOOKUPCODE') : (paramValueToSet ?? stringToTableCell(param.value, 'LOOKUPCODE'));
        let oldValueInNewRows = find(externalChannelDataRowsConverted, row => String(row.id) === dataValue);
        if (oldValueInNewRows) {
          if (!oldValue && paramValuesToSet[formID + '__' + param.id]) {
            paramValuesToSet[formID + '__' + param.id] = null;
          }
          updateParamValue(formID, param.id, oldValueInNewRows.value, false);
          return;
        }
      }
      if (oldValue !== null || !param.value) {
        updateParamValue(formID, param.id, tableRowToString(externalChannelData, externalChannelDataRows[0]).value, true);
      }
    } else if (externalChannelData && param.value) {
      updateParamValue(formID, param.id, null, true);
    }
  }

  const updateParamValue = (formID, paramID, value, manual) => {
    store.dispatch(actions.updateParam(formID, paramID, value, manual));
  }

  const loadFormParameters = async (formID, force) => {
    if (force || !store.getState().formParams[formID]) {
      const { ok, data } = await API.forms.getFormParameters(formID);
      if (!ok) return [];

      data.forEach((param) => {param.formId = formID});
      store.dispatch(actions.setParams(formID, data));
      data.forEach(async (param) => {
        if (param.externalChannelName && !param.canBeNull) {
          await store.getState().sessionManager.channelsManager.loadAllChannelData(param.externalChannelName, formID, false);
        }
      });
      return data;
    }
  }

  const loadFormSettings = async (formID, force = false) => {
    let data = store.getState().formSettings[formID];
    if (data) return data;
    if (force) {
      data = {};
    } else {
      const res = await API.forms.getFormSettings(formID);
      data = res.ok ? res.data : {};
    }
    store.dispatch(actions.setFormSettings(formID, data));
    return data;
  }

  const getCanRunReport = async (formID) => {
    const state = store.getState();
    reportFormID = formID;
    if (formID != null) {
      const paramValues = state.formParams[formID];
      const jsonToSend = {sessionId: state.sessionId, reportId: formID, paramValues: paramValues};
      const { data } = await API.programs.getCanRunReport(JSON.stringify(jsonToSend));
      if (state.canRunReport !== data) store.dispatch(actions.setCanRunReport(data));
    } else if (state.canRunReport) {
      store.dispatch(actions.setCanRunReport(false));
    }
  }

  // будет вызываться каждый раз при отправке действия (и когда состояние могло измениться)
  store.subscribe(() => {
    if (reportFormID) getCanRunReport(reportFormID).then();
    const formParams = store.getState().formParams;

    for (let formID in formParams) {
      for (let param in formParams[formID]) {
        setDefaultParamValue(formID, formParams[formID][param]);
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
