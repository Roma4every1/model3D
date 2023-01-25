import { EditorProps } from './base-editor';
import { useSelector } from 'react-redux';
import { DatePicker, DatePickerChangeEvent } from '@progress/kendo-react-dateinputs';


export const DateEditor = ({valueSelector, update}: EditorProps<ParamValueDate>) => {
  let value = useSelector(valueSelector);
  if (value === null) value = undefined;

  const onChange = (e: DatePickerChangeEvent) => update(e.value);
  return <DatePicker value={value} onChange={onChange}/>;
};
