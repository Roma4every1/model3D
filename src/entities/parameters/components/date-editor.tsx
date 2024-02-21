import { EditorProps } from './editor-dict.ts';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';


export const DateEditor = ({parameter, update}: EditorProps<ParamDate>) => {
  const value = parameter.value ? dayjs(parameter.value) : undefined;
  const onChange = (date: Dayjs) => update(date?.toDate() ?? null);
  return <DatePicker value={value} onChange={onChange} format={'DD.MM.YYYY'}/>;
};
