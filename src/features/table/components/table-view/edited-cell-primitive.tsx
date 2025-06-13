import type { KeyboardEvent } from 'react';
import type { CheckboxProps, ColorPickerProps } from 'antd';
import type { CellEditorProps } from '../../lib/types';
import { useState, useRef, useLayoutEffect } from 'react';
import { Checkbox, ColorPicker } from 'antd';
import { fixColorHEX } from 'shared/lib';


/** Редактор ячейки с логическим значением. */
export const BoolCellEditor = ({state, column, record, update}: CellEditorProps) => {
  const ref = useRef<any>();
  const cellValue: boolean | null = record.cells[column.columnIndex];
  const [innerValue, setInnerValue] = useState(cellValue);

  useLayoutEffect(() => {
    ref.current.focus();
    ref.current.input.nextElementSibling.style.outline = 'none';
  }, []);

  const onChange: CheckboxProps['onChange'] = (e) => {
    const value = e.target.checked;
    update(value); setInnerValue(value);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const key = e.nativeEvent.key;
    if (key === 'ArrowLeft') {
      state.actions.moveCellHorizontal(-1);
    } else if (key === 'ArrowRight') {
      state.actions.moveCellHorizontal(1);
    }
  };
  return <Checkbox ref={ref} checked={innerValue} onChange={onChange} onKeyDown={onKeyDown}/>;
};

/** Редактор ячейки с цветом. */
export const ColorCellEditor = ({column, record, update}: CellEditorProps) => {
  const cellValue = fixColorHEX(record.cells[column.columnIndex]);
  const [innerValue, setInnerValue] = useState<any>(cellValue);

  const onChange: ColorPickerProps['onChange'] = (color) => {
    update('#FF' + color.toHex());
    setInnerValue(color);
  };
  return <ColorPicker value={innerValue} onChange={onChange} disabledAlpha={true}/>;
};
