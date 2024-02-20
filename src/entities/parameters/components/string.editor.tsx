import { EditorProps } from './editor-dict.ts';
import { InputChangeEvent, Input } from '@progress/kendo-react-inputs';


export const StringEditor = ({parameter, update}: EditorProps<ParamString>) => {
  let value = parameter.value;
  if (value === null) value = undefined;

  const onChange = (e: InputChangeEvent) => update(e.value);
  return <Input value={value} autoComplete={'off'} onChange={onChange}/>;
};
