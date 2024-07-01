import type { EditorProps } from './editor-dict';
import { useEffect, useRef, useState } from 'react';
import { InputNumber } from 'antd';


/** Редактор параметра типа `integer`. */
export const IntegerEditor = ({parameter, update}: EditorProps<'integer'>) => {
  const value = parameter.getValue();
  const [innerValue, setInnerValue] = useState(value);
  const timer = useRef<number>();

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const onChange = (newValue: number | null) => {
    if (newValue !== null) newValue = Math.trunc(newValue);
    setInnerValue(newValue);
    window.clearTimeout(timer.current); // debounce
    timer.current = window.setTimeout(update, 750, newValue);
  };

  const disabled = parameter.editor.disabled;
  return <InputNumber value={innerValue} onChange={onChange} disabled={disabled}/>;
};
