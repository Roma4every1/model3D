import { EditorProps } from './editor-dict';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';


export const DateIntervalEditor = ({parameter, update}: EditorProps<'dateInterval'>) => {
  const parameterValue = parameter.getValue();
  const startDate = parameterValue?.start ?? null;
  const endDate = parameterValue?.end ?? null;

  const start = startDate ? dayjs(startDate) : undefined;
  const end = endDate ? dayjs(endDate) : undefined;

  const onStartChange = (value: Dayjs) => {
    if (value) {
      let date = value.toDate();
      if (end && value > end) date = new Date(endDate);
      update({start: date, end: endDate});
    } else {
      update({start: null, end: endDate});
    }
  };
  const onEndChange = (value: Dayjs) => {
    if (value) {
      let date = value.toDate();
      if (start && value < start) date = new Date(startDate);
      update({start: startDate, end: date});
    } else {
      update({start: startDate, end: null});
    }
  };

  const format = 'DD.MM.YYYY';
  const disabled = parameter.editor.disabled;

  return (
    <div style={{height: 46}}>
      <DatePicker
        value={start} onChange={onStartChange} maxDate={end}
        format={format} disabled={disabled}
      />
      <DatePicker
        value={end} onChange={onEndChange} minDate={start}
        format={format} disabled={disabled}
      />
    </div>
  );
};
