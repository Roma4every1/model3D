import { EditorProps } from './editor-dict.ts';
import { InputNumber } from 'antd';


/** Редактор параметра типа `integer`. */
export const IntegerEditor = ({parameter, update}: EditorProps<ParamInteger>) => {
  const onChange = (value: number | null) => {
    if (value !== null) value = Math.trunc(value);
    update(value);
  };
  return <InputNumber value={parameter.value} onChange={onChange} size={'small'}/>;
};
