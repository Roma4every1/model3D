import React, { useState, useCallback } from "react";
import { DateRangePicker } from "@progress/kendo-react-dateinputs";


const pattern = /(\d{2})\.(\d{2})\.(\d{4})/;

const getDefaultValue = (string) => {
  try {
    const index = string.indexOf(' - ');
    if (index <= 0) return;
    const startDateString = string.slice(0, index);
    const finishDateString = string.slice(index + 3);
    return {
      start: new Date(startDateString.replace(' \\d', '').replace(pattern, '$3/$2/$1')),
      end: new Date(finishDateString.replace(' \\d', '').replace(pattern, '$3/$2/$1'))
    }
  } catch {}
}

const valueToString = (value) => {
  if (!value.start || !value.end) return '';
  return value.start.toLocaleDateString() + ' - ' + value.end.toLocaleDateString();
};


export default function DateIntervalTextEditor({ id, value: rawValue, selectionChanged }) {
  const [value, setValue] = useState(getDefaultValue(rawValue));

  const changeValue = useCallback((localValue) => {
    selectionChanged({target: {name: id, value: valueToString(localValue ?? value)}});
  }, [value, id, selectionChanged]);

  const handleChange = useCallback((event) => {
    if (event.syntheticEvent.type === 'click') changeValue(event.target.value);
    setValue(event.value);
  }, [changeValue]);

  return (
    <DateRangePicker
      className={'date-interval-text-editor'}
      id={id} name={id} value={value}
      startDateInputSettings={{label: ''}}
      endDateInputSettings={{label: ''}}
      onChange={handleChange} onBlur={() => changeValue()}
    />
  );
}
