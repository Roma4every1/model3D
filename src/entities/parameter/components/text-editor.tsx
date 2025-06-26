import type { ChangeEvent } from 'react';
import type { EditorProps } from './editor-dict';
import { useEffect, useRef, useState } from 'react';
import { Input } from 'antd';


/** Редактор параметра типа `string`. */
export const TextEditor = ({parameter, update}: EditorProps<'string'>) => {
  const value = parameter.getValue();
  const [innerValue, setInnerValue] = useState(value);
  const timer = useRef<number>();

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newInnerValue = e.target.value;
    const newValue = newInnerValue.length ? newInnerValue : null;
    setInnerValue(newInnerValue);
    window.clearTimeout(timer.current); // debounce
    timer.current = window.setTimeout(update, 400, newValue);
  };
  const onBlur = () => {
    const currentValue = innerValue?.length ? innerValue : null;
    if (currentValue !== value) update(currentValue);
  };

  return (
    <Input.TextArea
      className={'text-editor'} autoSize={{minRows: 1, maxRows: 5}}
      value={innerValue} onChange={onChange} onBlur={onBlur}
      autoComplete={'off'} disabled={parameter.editor.disabled}
    />
  );
};
