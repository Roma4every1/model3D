import type { ChangeEvent } from 'react';
import type { EditorProps } from './editor-dict';
import { useEffect, useRef, useState } from 'react';
import { Input } from 'antd';


/** Редактор параметра типа `string`. */
export const StringEditor = ({parameter, update}: EditorProps<'string'>) => {
  const value = parameter.getValue();
  const [innerValue, setInnerValue] = useState(value);
  const timer = useRef<number>();

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newInnerValue = e.target.value;
    const newValue = newInnerValue.length ? newInnerValue : null;
    setInnerValue(newInnerValue);
    window.clearTimeout(timer.current); // debounce
    timer.current = window.setTimeout(update, 750, newValue);
  };

  const disabled = parameter.editor.disabled;
  return <Input value={innerValue} autoComplete={'off'} onChange={onChange} disabled={disabled}/>;
};
