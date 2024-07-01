import type { EditorProps } from './editor-dict';
import type { CheckboxProps } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { Checkbox } from 'antd';


export const BoolEditor = ({parameter, update}: EditorProps<'bool'>) => {
  const value = parameter.getValue() ?? false;
  const [innerValue, setInnerValue] = useState(value);
  const timer = useRef<number>();

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const onChange: CheckboxProps['onChange'] = (e) => {
    const newValue = e.target.checked;
    setInnerValue(newValue);
    window.clearTimeout(timer.current); // debounce
    timer.current = window.setTimeout(update, 750, newValue);
  };

  const disabled = parameter.editor.disabled;
  return <Checkbox checked={innerValue} onChange={onChange} disabled={disabled}/>;
};
