import { EditorProps } from './editor-dict.ts';
import { DatePickerChangeEvent, DatePicker } from '@progress/kendo-react-dateinputs';


export const DateIntervalEditor = ({parameter, update}: EditorProps<ParamDateInterval>) => {
  const start = parameter.value.start ?? undefined;
  const end = parameter.value.end ?? undefined;

  const onStartChange = ({value}: DatePickerChangeEvent) => {
    if (value > end) value = new Date(end);
    update({start: value, end});
  };
  const onEndChange = ({value}: DatePickerChangeEvent) => {
    if (value < start) value = new Date(start);
    update({start, end: value});
  };

  return (
    <div style={{height: 40}}>
      <DatePicker value={start} onChange={onStartChange} max={end}/>
      <DatePicker value={end} onChange={onEndChange} min={start}/>
    </div>
  );
};
