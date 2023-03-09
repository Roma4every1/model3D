import { EditorProps } from './base-editor';
import { CheckboxChangeEvent, Checkbox } from '@progress/kendo-react-inputs';


export const BoolEditor = ({parameter, update}: EditorProps<ParamBool>) => {
  let value = parameter.value;
  if (value === null) value = false;

  const onChange = (e: CheckboxChangeEvent) => update(e.value);
  return <Checkbox value={value} onChange={onChange}/>;
};
