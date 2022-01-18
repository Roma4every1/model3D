import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import setFormSettings from "../../../../store/actionCreators/setFormSettings";
var utils = require("../../../../utils");

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
        var channelProperty = tableSettings?.columns?.ColumnGroupSettings.find(cs => cs.columnGroupName === item);
        if (channelProperty && (channelProperty.calculatedDisplayName !== addedProperty)) {
            changed = true;
            channelProperty.calculatedDisplayName = addedProperty;
        }
    }
    else if (path === 'ColumnsSettings') {
        var channelProperty = tableSettings?.columns?.columnsSettings.find(cs => cs.channelPropertyName === item);
        if (channelProperty && (channelProperty.calculatedDisplayName !== addedProperty)) {
            changed = true;
            channelProperty.calculatedDisplayName = addedProperty;
        }
    }
    if (changed) {
        dispatch(setFormSettings(formId, { ...tableSettings }));
    }

    return (
        <div />);
}