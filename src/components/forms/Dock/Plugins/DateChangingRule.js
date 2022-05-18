import React from 'react';
import { useSelector } from 'react-redux';
import {stringToTableCell} from "../../../../utils";


export default function DateChangingRule(props) {
    const { yearParameter, dateIntervalParameter, columnNameParameter, formId } = props;
    const paramsManager = useSelector((state) => state.sessionManager.paramsManager);

    const neededParamValues = paramsManager.getParameterValues([yearParameter], formId, false)
    const dateIntervalParameterValue = paramsManager.getParameterValues([dateIntervalParameter], formId, false)

    if (neededParamValues.length > 0 && columnNameParameter) {
        const propertyValue = stringToTableCell(neededParamValues[0].value, columnNameParameter);
        const newValue = `01/01/${propertyValue} 00:00:00 - 12/31/${propertyValue} 00:00:00`;

        if (dateIntervalParameterValue[0].value !== newValue) {
            paramsManager.updateParamValue(formId, dateIntervalParameter, newValue, true);
        }
    }

    return <div />;
}
