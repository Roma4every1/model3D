import { EditorProps } from './editor-dict';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';


export const DateEditor = ({parameter, update}: EditorProps<'date'>) => {
  const rawValue = parameter.getValue();
  const value = rawValue ? dayjs(rawValue) : undefined;

  const disabled = parameter.editor.disabled;
  const onChange = (date: Dayjs) => update(date?.toDate() ?? null);
  return <DatePicker value={value} onChange={onChange} format={'DD.MM.YYYY'} disabled={disabled}/>;
};
