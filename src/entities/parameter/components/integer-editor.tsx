import { EditorProps } from './editor-dict';
import { InputNumber } from 'antd';


/** Редактор параметра типа `integer`. */
export const IntegerEditor = ({parameter, update}: EditorProps<'integer'>) => {
  const onChange = (value: number | null) => {
    if (value !== null) value = Math.trunc(value);
    update(value);
  };
  return <InputNumber value={parameter.getValue()} onChange={onChange}/>;
};
