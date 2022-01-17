import React from 'react';
import { useSelector } from 'react-redux';
var utils = require("../../../../utils");

export default function DateChangingRule(props) {
    const { yearParameter, dateIntervalParameter, columnNameParameter, formId } = props;
    const sessionManager = useSelector((state) => state.sessionManager);
    var neededParamValues = useSelector((state) => state.sessionManager.paramsManager.getParameterValues([yearParameter], formId, false));
    var dateIntervalParameterValue = useSelector((state) => state.sessionManager.paramsManager.getParameterValues([dateIntervalParameter], formId, false));
    if (neededParamValues.length > 0) {
        let propertyValue = utils.stringToTableCell(neededParamValues[0].value, columnNameParameter);
        let newValue = `01/01/${propertyValue} 00:00:00 - 12/31/${propertyValue} 00:00:00`;
        if (dateIntervalParameterValue[0].value !== newValue) {
            sessionManager.paramsManager.updateParamValue(formId, dateIntervalParameter, newValue, true);
        }
    }

    return (
        <div />);
}