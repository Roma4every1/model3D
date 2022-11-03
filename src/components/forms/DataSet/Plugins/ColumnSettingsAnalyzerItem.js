import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { actions } from "../../../../store";

var utils = require("../../../../utils/utils");

export default function ColumnSettingsAnalyzerItem(props) {
    const { item, parameterName, path, propertyName, type, formId, start, finish } = props;
    const dispatch = useDispatch();
    var neededParamValues = useSelector((state) => state.sessionManager.paramsManager.getParameterValues([parameterName], formId, false));
    let propertyValue = neededParamValues[0].value;
    if (type === 'CellValue' && propertyValue) {
        propertyValue = utils.stringToTableCell(neededParamValues[0].value, propertyName);
    }
    var addedProperty = propertyValue ? start + propertyValue + finish : null;
    const tableSettings = useSelector((state) => state.formSettings[formId]);
    let changed = false;
    if (path === 'ColumnGroupSettings') {
        let channelProperty = tableSettings?.columns?.ColumnGroupSettings.find(cs => cs.columnGroupName === item);
        if (channelProperty && (channelProperty.calculatedDisplayName !== addedProperty)) {
            changed = true;
            channelProperty.calculatedDisplayName = addedProperty;
        }
    }
    else if (path === 'ColumnsSettings') {
        let channelProperty = tableSettings?.columns?.columnsSettings.find(cs => cs.channelPropertyName === item);
        if (channelProperty && (channelProperty.calculatedDisplayName !== addedProperty)) {
            changed = true;
            channelProperty.calculatedDisplayName = addedProperty;
        }
    }
    if (changed) {
        dispatch(actions.setFormSettings(formId, { ...tableSettings }));
    }

    return (
        <div />);
}