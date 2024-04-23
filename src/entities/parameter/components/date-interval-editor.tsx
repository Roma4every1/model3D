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
    let date = value.toDate();
    if (value > end) date = new Date(endDate);
    update({start: date, end: endDate});
  };
  const onEndChange = (value: Dayjs) => {
    let date = value.toDate();
    if (value < start) date = new Date(startDate);
    update({start: startDate, end: date});
  };

  return (
    <div style={{height: 46}}>
      <DatePicker
        value={start} onChange={onStartChange} maxDate={end}
        format={'DD.MM.YYYY'} size={'small'}
      />
      <DatePicker
        value={end} onChange={onEndChange} minDate={start}
        format={'DD.MM.YYYY'} size={'small'}
      />
    </div>
  );
};
