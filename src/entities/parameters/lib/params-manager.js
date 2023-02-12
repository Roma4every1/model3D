import { find } from 'lodash';
import { getParentFormId, tableRowToString } from '../../../shared/lib';
import { addParam, updateParam } from '../store/parameters.actions';
import { setCanRunReport } from '../../reports';
import { programsAPI } from '../../reports/lib/programs.api';


export function createParamsManager(store) {
  let reportFormID = null;

  const getParameterValues = (neededParamList, formID, addToLocal, channelName) => {
    const paramsToUse = [];
    const formParams = store.getState().parameters;
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
          store.dispatch(updateParam(formID, param, element.value));
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
          store.dispatch(addParam(formID, newElement));
        }
        paramsToUse.push(newElement);
      } else {
        paramsToUse.push(element);
      }
    });
    return paramsToUse;
  }

  /** Позволяет обновить сразу несколько параметров. */
  const updateParamSet = (formID, newParamValues) => {
    const params = store.getState().parameters[formID];
    newParamValues.forEach(p => {
      const param = params.find(pp => pp.id === p.id);
      if (!param) return;

      if (param.externalChannelName) {
        const externalChannelData = store.getState().channels[param.externalChannelName].data;
        const rows = externalChannelData?.data?.rows;

        if (rows && rows.length > 0) {
          const rowsConverted = rows.map(row => tableRowToString(externalChannelData, row));
          let oldValueInNewRows = find(rowsConverted, row => String(row.id) === p.value);
          if (oldValueInNewRows) {
            store.dispatch(updateParam(formID, param.id, oldValueInNewRows.value));
          }
        }
      } else {
        store.dispatch(updateParam(formID, param.id, p.value));
      }
    });
  };

  const getCanRunReport = async (reportID) => {
    const state = store.getState();
    reportFormID = reportID;
    if (reportID != null) {
      const paramValues = state.parameters[reportID];
      const { ok, data } = await programsAPI.getCanRunReport(reportID, paramValues);
      if (ok && state.canRunReport !== data) store.dispatch(setCanRunReport(data));
    } else if (state.canRunReport) {
      store.dispatch(setCanRunReport(false));
    }
  }

  // будет вызываться каждый раз при отправке действия (и когда состояние могло измениться)
  store.subscribe(() => {
    if (reportFormID) getCanRunReport(reportFormID).then();
  });

  return {
    getParameterValues,
    getCanRunReport,
    updateParamSet
  };
}
