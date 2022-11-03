import React from 'react';
import { useSelector } from 'react-redux';
var utils = require("../../../../utils/utils");

export default function ColumnHeaderLabelSetter(props) {
    const { parameter, property, column, formId } = props;
    var neededParamValues = useSelector((state) => state.sessionManager.paramsManager.getParameterValues([parameter], formId, false));
    let propertyValue = utils.stringToTableCell(neededParamValues[0].value, column);
    const tableSettings = useSelector((state) => state.formSettings[formId]);
    var channelProperty = tableSettings?.columns?.columnsSettings.find(cs => cs.channelPropertyName === property);
    if (channelProperty && (channelProperty.displayName !== propertyValue)) {
        channelProperty.displayName = propertyValue;
    }

    return (
        <div />);
}