import { find } from "lodash";
import { getParentFormId, tableRowToString } from "../utils/utils";
import { actions } from "../store";
import { API } from "../api/api";


export default function createParamsManager(store) {
  let reportFormID = null;

  const getParameterValues = (neededParamList, formID, addToLocal, channelName) => {
    const paramsToUse = [];
    const formParams = store.getState().formParams;
    neededParamList.forEach(paramElement => {
      let element = null;
      let currentFormId = formID;
      const param = paramElement.Key ?? paramElement;
      const findByID = (p) => p.id === param;

      while (!element || (addToLocal && (currentFormId === getParentFormId(formID)))) {
        element = formParams[currentFormId]?.find(findByID);
        if (currentFormId === '') break;
        currentFormId = getParentFormId(currentFormId);
      }

      if (!element && channelName) {
        element = formParams[channelName]?.find(findByID);
      }
      if (element?.value === undefined) return;

      if (addToLocal && (element.formID !== formID)) {
        let localElement = formParams[formID]?.find(findByID);
        if (localElement) {
          updateParamValue(formID, param, element.value);
        } else {
          var newElement = {
            id: element.id,
            canBeNull: element.canBeNull,
            nullDisplayValue: element.nullDisplayValue,
            showNullValue: element.showNullValue,
            formID: formID,
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
    });
    return paramsToUse;
  }

  const updateParamValue = (formID, paramID, value) => {
    store.dispatch(actions.updateParam(formID, paramID, value));
  };

  /** Позволяет обновить сразу несколько параметров.
   *
   * Используется только при работе с картами (ProgramParametersList.js).
   * */
  const updateParamSet = (formID, newParamValues) => {
    const params = store.getState().formParams[formID];
    newParamValues.forEach(p => {
      const param = params.find(pp => pp.id === p.id);
      if (!param) return;

      if (param.externalChannelName) {
        const externalChannelData = store.getState().channelsData[param.externalChannelName];
        const rows = externalChannelData?.data?.Rows;

        if (rows && rows.length > 0) {
          const rowsConverted = rows.map(row => tableRowToString(externalChannelData, row));
          let oldValueInNewRows = find(rowsConverted, row => String(row.id) === p.value);
          if (oldValueInNewRows) {
            updateParamValue(formID, param.id, oldValueInNewRows.value);
          }
        }
      } else {
        updateParamValue(formID, param.id, p.value);
      }
    });
  };

  const loadFormParameters = async (formID, force) => {
    if (force || !store.getState().formParams[formID]) {
      const { ok, data } = await API.forms.getFormParameters(formID);
      if (!ok) return [];

      data.forEach((param) => {param.formID = formID});
      store.dispatch(actions.setParams(formID, data));
      data.forEach(async (param) => {
        if (param.externalChannelName && !param.canBeNull) {
          await store.getState().sessionManager.channelsManager.loadAllChannelData(param.externalChannelName, formID, false);
        }
      });
      return data;
    }
  }

  const loadFormSettings = async (formID, force) => {
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
  });

  return {
    loadFormParameters,
    loadFormSettings,
    getParameterValues,
    getCanRunReport,
    updateParamSet
  };
}
