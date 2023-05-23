import { EditorProps } from './base-editor';
import { DatePickerChangeEvent, DatePicker } from '@progress/kendo-react-dateinputs';


export const DateIntervalEditor = ({parameter, update}: EditorProps<ParamDateInterval>) => {
  const start = parameter.value.start ?? undefined;
  const end = parameter.value.end ?? undefined;

  const onStartChange = (e: DatePickerChangeEvent) => {
    update({start: e.value, end});
  };
  const onEndChange = (e: DatePickerChangeEvent) => {
    update({start, end: e.value});
  };

  return (
    <div style={{height: 40}}>
      <DatePicker value={start} onChange={onStartChange} max={end}/>
      <DatePicker value={end} onChange={onEndChange} min={start}/>
    </div>
  );
};
