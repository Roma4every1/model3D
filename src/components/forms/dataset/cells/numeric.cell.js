import React from "react";
import { NumericTextBox } from "@progress/kendo-react-inputs";


export const NumericCell = ({dataValue, dataItem, field, onChange}) => {
  const handleChange = (e) => {
    if (!onChange) return;
    const value = e.target.value;
    onChange({dataIndex: 0, dataItem, field, syntheticEvent: e.syntheticEvent, value});
  };

  const value = typeof dataValue === 'string'
    ? parseFloat(dataValue.replaceAll(',', '.'))
    : dataValue;

  return <NumericTextBox onChange={handleChange} value={value}/>;
};
