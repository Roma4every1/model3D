import type { KeyboardEvent } from 'react';
import type { CellEditorProps } from '../../lib/types';
import dayjs, { Dayjs } from 'dayjs';
import { useState, useRef, useLayoutEffect } from 'react';
import { DatePicker } from 'antd';
import { parseDate, parseDateTime, stringifyLocalDate, stringifyLocalDateTime } from 'shared/lib';
import { handleCellInputKeydown } from '../../lib/utils';


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
      ref={ref} format={'DD.MM.YYYY'} value={innerValue}
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
      ref={ref} format={'DD.MM.YYYY HH:mm'} showTime={true} needConfirm={false}
      value={innerValue} onChange={onChange} onCalendarChange={onChange}
      onKeyDown={onKeyDown} onOpenChange={setOpen}
    />
  );
};
