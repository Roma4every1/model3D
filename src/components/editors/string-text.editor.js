import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@progress/kendo-react-inputs";


export default function StringTextEditor({ id, value, selectionChanged }) {
  const [valueToShow, setValueToShow] = useState('');

  useEffect(() => {
    let ignore = false;
    if (!ignore) setValueToShow(value || '');
    return () => { ignore = true; }
  }, [value]);

  const onChange = useCallback((event) => {
    setValueToShow(event.value);
    selectionChanged(event);
  }, [selectionChanged]);

  return <Input className={'parametereditor'} value={valueToShow} name={id} onChange={onChange}/>;
}
