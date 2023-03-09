import { EditorProps } from './base-editor';
import { DatePickerChangeEvent, DatePicker } from '@progress/kendo-react-dateinputs';


export const DateIntervalEditor = ({parameter, update}: EditorProps<ParamDateInterval>) => {
  let value = parameter.value;
  if (!value) value = {start: undefined, end: undefined};

  const onStartChange = (e: DatePickerChangeEvent) => {
    update({start: e.value, end: value.end});
  };
  const onEndChange = (e: DatePickerChangeEvent) => {
    update({start: value.start, end: e.value});
  };

  return (
    <div style={{height: 40}}>
      <DatePicker value={value.start} onChange={onStartChange} max={value.end}/>
      <DatePicker value={value.end} onChange={onEndChange} min={value.start}/>
    </div>
  );
};
