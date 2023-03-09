import { KeyboardEvent, useState } from 'react';
import { EditCellProps } from './base-edit-cell';
import { CheckboxChangeEvent, Checkbox } from '@progress/kendo-react-inputs';
import { DatePickerChangeEvent, DatePicker } from '@progress/kendo-react-dateinputs';


/** Редактор ячейки с булевым значением. */
export const EditCellBool = ({value, update, actions}: EditCellProps<boolean>) => {
  const [innerValue, setInnerValue] = useState(value);

  const onChange = ({value}: CheckboxChangeEvent) => {
    update(value); setInnerValue(value);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const key = e.nativeEvent.key;
    if (key === 'ArrowLeft') {
      actions.moveCellHorizontal(-1);
    } else if (key === 'ArrowRight') {
      actions.moveCellHorizontal(1);
    }
  };

  return <Checkbox checked={innerValue} onChange={onChange} onKeyDown={onKeyDown}/>;
};

/** Редактор ячейки с датой. */
export const EditCellDate = ({value, update}: EditCellProps<Date>) => {
  const [innerValue, setInnerValue] = useState(value);

  const onChange = ({value}: DatePickerChangeEvent) => {
    update(value); setInnerValue(value);
  };
  return <DatePicker value={innerValue} onChange={onChange} rounded={null}/>;
};
