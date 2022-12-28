import { useSelector } from "react-redux";
import { stringToTableCell } from "../../../utils/utils";


export default function FormDisplayName({formID, pattern}) {
  const selector = (state: WState) => getLinkedPropertyValue(pattern, formID, state);
  return useSelector(selector);
}

function getLinkedPropertyValue(displayNameString: string, formID: FormID, state: WState) {
  let startFoundIndex = 0, startIndex = 0, finish = '', returnString = '';
  let resultBroken = false;

  while (startIndex > -1) {
    startIndex = displayNameString.indexOf('$(', startFoundIndex);
    if (startIndex > -1) {
      let finishIndex = displayNameString.indexOf(')', startIndex);
      let start = displayNameString.slice(startFoundIndex + 1, startIndex);

      startFoundIndex = finishIndex;
      finish = displayNameString.slice(finishIndex + 1);

      let pathToChange = displayNameString.slice(startIndex + 2, finishIndex);
      let pointIndex = pathToChange.indexOf('.');
      let bracketIndex = pathToChange.indexOf('[');
      let semicolonIndex = pathToChange.indexOf(':');
      let parameterName = pathToChange.slice(0, pointIndex);
      let type = pathToChange.slice(pointIndex + 1, bracketIndex);
      let propertyName = pathToChange.slice(bracketIndex + 1, semicolonIndex > -1 ? semicolonIndex - 1 : -1);
      let defaultValue = semicolonIndex > -1 ? pathToChange.slice(semicolonIndex + 1) : null;

      if (bracketIndex < 0) {
        type = pathToChange.slice(pointIndex + 1);
        propertyName = null;
      }

      const neededParamValues = state.sessionManager.paramsManager
        .getParameterValues([parameterName], formID, false, undefined);
      let propertyValue = neededParamValues[0]?.value;

      if (type === 'CellValue' && propertyValue) {
        propertyValue = stringToTableCell(neededParamValues[0].value, propertyName);
      }

      if (propertyValue || defaultValue) {
        returnString += start + (propertyValue ?? defaultValue);
      } else {
        returnString = '';
        resultBroken = true;
        break;
      }
    }
  }
  if (!resultBroken) returnString += finish;
  return returnString;
}
