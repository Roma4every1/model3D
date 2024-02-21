import { EditorProps } from './editor-dict.ts';
import { Checkbox } from 'antd';


export const BoolEditor = ({parameter, update}: EditorProps<ParamBool>) => {
  let value = parameter.value;
  if (value === null) value = false;

  const onChange = (e) => update(e.target.checked);
  return <Checkbox checked={value} onChange={onChange}/>;
};
