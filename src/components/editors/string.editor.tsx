import { EditorProps } from './base-editor';
import { useSelector } from 'react-redux';
import { InputChangeEvent, Input } from '@progress/kendo-react-inputs';


export const StringEditor = ({valueSelector, update}: EditorProps<ParamValueString>) => {
  let value = useSelector(valueSelector);
  if (value === null) value = undefined;

  const onChange = (e: InputChangeEvent) => update(e.value);
  return <Input value={value} autoComplete={'off'} onChange={onChange}/>;
};
