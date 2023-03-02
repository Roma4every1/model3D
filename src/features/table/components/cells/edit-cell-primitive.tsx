import { EditCellProps } from './base-edit-cell';
import { CheckboxChangeEvent, Checkbox } from '@progress/kendo-react-inputs';
import { DatePickerChangeEvent, DatePicker } from '@progress/kendo-react-dateinputs';


/** Редактор ячейки с булевым значением. */
export const EditCellBool = ({value, update}: EditCellProps<boolean>) => {
  const onChange = (e: CheckboxChangeEvent) => {
    update(e.value);
  };
  return <Checkbox checked={value} onChange={onChange}/>;
};


/** Редактор ячейки с датой. */
export const EditCellDate = ({value, update}: EditCellProps<Date>) => {
  const onChange = (e: DatePickerChangeEvent) => {
    update(e.value);
  };
  return <DatePicker value={value} onChange={onChange}/>;
};
