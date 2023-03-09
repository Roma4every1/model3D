import { EditorProps } from './base-editor';
import { DatePicker, DatePickerChangeEvent } from '@progress/kendo-react-dateinputs';


export const DateEditor = ({parameter, update}: EditorProps<ParamDate>) => {
  let value = parameter.value;
  if (value === null) value = undefined;

  const onChange = (e: DatePickerChangeEvent) => update(e.value);
  return <DatePicker value={value} onChange={onChange}/>;
};
