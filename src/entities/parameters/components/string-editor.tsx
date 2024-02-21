import { EditorProps } from './editor-dict';
import { ChangeEvent } from 'react';
import { Input } from 'antd';


/** Редактор параметра типа `string`. */
export const StringEditor = ({parameter, update}: EditorProps<ParamString>) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    update(inputValue.length ? inputValue : null);
  };
  return <Input value={parameter.value} autoComplete={'off'} onChange={onChange}/>;
};
