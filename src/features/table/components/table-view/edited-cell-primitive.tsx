import type { KeyboardEvent } from 'react';
import type { CheckboxProps, ColorPickerProps } from 'antd';
import type { CellEditorProps } from '../../lib/types';
import dayjs, { Dayjs } from 'dayjs';
import { useState, useRef, useLayoutEffect } from 'react';
import { DatePicker, Checkbox, ColorPicker } from 'antd';
import { parseDate, parseDateTime, stringifyLocalDate, stringifyLocalDateTime, fixColorHEX } from 'shared/lib';
import { handleCellInputKeydown } from '../../lib/utils';


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

/** Редактор ячейки с датой. */
export const DateCellEditor = ({state, column, record, update}: CellEditorProps) => {
  const ref = useRef<any>();
  const cellValue: string | null = record.cells[column.columnIndex];
  const [open, setOpen] = useState(false);
  const [innerValue, setInnerValue] = useState(cellValue ? dayjs(cellValue) : null);

  useLayoutEffect(() => {
    ref.current.focus();
    const input: HTMLInputElement = ref.current.nativeElement.firstElementChild.firstElementChild;

    const onInput = () => {
      const value = parseDate(input.value);
      update(value ? stringifyLocalDate(value) : null);
    };
    input.addEventListener('input', onInput);
    return () => input.removeEventListener('input', onInput);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (value: Dayjs | null) => {
    update(value ? stringifyLocalDate(value.toDate()) : null);
    setInnerValue(value);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.nativeEvent.key !== 'Enter') return handleCellInputKeydown(e, state.actions);
    if (!open) e.stopPropagation();
  };

  return (
    <DatePicker
      ref={ref} mode={'date'} format={'DD.MM.YYYY'} value={innerValue}
      onChange={onChange} onKeyDown={onKeyDown} onOpenChange={setOpen}
    />
  );
};

export const DateTimeCellEditor = ({state, column, record, update}: CellEditorProps) => {
  const ref = useRef<any>();
  const cellValue: string | null = record.cells[column.columnIndex];
  const [open, setOpen] = useState(false);
  const [innerValue, setInnerValue] = useState(cellValue ? dayjs(cellValue) : null);

  useLayoutEffect(() => {
    ref.current.focus();
    const input: HTMLInputElement = ref.current.nativeElement.firstElementChild.firstElementChild;

    const onInput = () => {
      const value = parseDateTime(input.value);
      update(value ? stringifyLocalDateTime(value) : null);
    };
    input.addEventListener('input', onInput);
    return () => input.removeEventListener('input', onInput);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (value: Dayjs | null) => {
    update(value ? stringifyLocalDateTime(value.toDate()) : null);
    setInnerValue(value);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.nativeEvent.key !== 'Enter') return handleCellInputKeydown(e, state.actions);
    if (!open) e.stopPropagation();
  };

  return (
    <DatePicker
      ref={ref} mode={'date'} showTime={{format: 'HH:mm'}} format={'DD.MM.YYYY HH:mm'}
      value={innerValue} onChange={onChange} onKeyDown={onKeyDown} onOpenChange={setOpen}
    />
  );
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
