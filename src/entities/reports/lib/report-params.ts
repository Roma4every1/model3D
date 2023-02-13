import { Dispatch } from 'redux';
import { getParentFormId } from 'shared/lib';
import { addParam, updateParam } from 'entities/parameters';


export const addReportParams = (
  reportID: ReportID, neededParamList,
  paramDict: ParamDict, dispatch: Dispatch
) => {
  neededParamList.forEach(([paramID, nullEditor]) => {
    let element: Parameter = null;
    let currentFormId = reportID;
    const findByID = (p) => p.id === paramID;

    while (!element || currentFormId === getParentFormId(reportID)) {
      element = paramDict[currentFormId]?.find(findByID);
      if (currentFormId === '') break;
      currentFormId = getParentFormId(currentFormId);
    }

    if (element?.value === undefined) return;

    if (element.formID !== reportID) {
      let localElement = paramDict[reportID]?.find(findByID);
      if (localElement) {
        dispatch(updateParam(reportID, paramID, element.value));
      } else {
        const newElement: Parameter = {
          id: element.id,
          canBeNull: element.canBeNull,
          nullDisplayValue: element.nullDisplayValue,
          showNullValue: element.showNullValue,
          formID: reportID,
          value: element.value as any,
          dependsOn: element.dependsOn,
          type: element.type,
          editorType: nullEditor ? null : element.editorType,
          editorDisplayOrder: element.editorDisplayOrder,
          externalChannelName: element.externalChannelName,
          displayName: element.displayName
        };
        dispatch(addParam(reportID, newElement));
      }
    }
  });
};
