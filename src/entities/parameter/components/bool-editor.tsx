import { EditorProps } from './editor-dict';
import { Checkbox } from 'antd';


export const BoolEditor = ({parameter, update}: EditorProps<'bool'>) => {
  let value = parameter.getValue();
  if (value === null) value = false;

  const onChange = (e) => update(e.target.checked);
  return <Checkbox checked={value} onChange={onChange}/>;
};
