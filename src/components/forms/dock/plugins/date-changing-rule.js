import React from "react";
import { useSelector } from "react-redux";
import { stringToTableCell } from "../../../../utils/utils";


const paramsManagerSelector = (state) => state.sessionManager.paramsManager;

export default function DateChangingRule(props) {
  const { yearParameter, dateIntervalParameter, columnNameParameter, formID } = props;
  const paramsManager = useSelector(paramsManagerSelector);

  const neededParamValues = paramsManager.getParameterValues(
    [yearParameter], formID, false
  );
  const dateIntervalParameterValue = paramsManager.getParameterValues(
    [dateIntervalParameter], formID, false
  );

  if (neededParamValues.length > 0 && columnNameParameter) {
    const propertyValue = stringToTableCell(neededParamValues[0].value, columnNameParameter);
    const newValue = `01/01/${propertyValue} 00:00:00 - 12/31/${propertyValue} 00:00:00`;

    if (dateIntervalParameterValue[0].value !== newValue) {
      paramsManager.updateParamValue(formID, dateIntervalParameter, newValue, true);
    }
  }

  return <div/>;
}
