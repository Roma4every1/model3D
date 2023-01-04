import React from "react";
import { DatePicker } from "@progress/kendo-react-dateinputs";


export const DateCell = ({dataValue, dataItem, field, onChange}) => {
  const handleChange = (e) => {
    if (!onChange) return;
    const value = e.target.value;
    onChange({dataIndex: 0, dataItem, field, syntheticEvent: e.syntheticEvent, value});
  };

  return (
    <DatePicker
      onChange={handleChange}
      defaultValue={typeof dataValue === 'object' ? dataValue : undefined}
    />
  );
};
