import type { ChangeEvent, KeyboardEvent } from 'react';
import type { CellEditorProps } from '../../lib/types';
import { useState, useRef, useLayoutEffect } from 'react';
import { inputIntParser, inputNumberParser } from 'shared/locales';
import { handleCellInputKeydown } from '../../lib/utils';


/** Редактор числовой или текстовой ячейки. */
export const InputCellEditor = ({state, column, record, update}: CellEditorProps) => {
  const ref = useRef<HTMLInputElement>();
  const cellValue = record.cells[column.columnIndex];
  const [innerValue, setInnerValue] = useState(cellValue?.toString() ?? '');

  useLayoutEffect(() => {
    ref.current.focus();
    ref.current.select();
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    let valueToSave: any = newValue;

    if (valueToSave.length === 0) {
      valueToSave = null;
    } else if (column.type === 'int') {
      valueToSave = inputIntParser(valueToSave);
    } else if (column.type === 'real') {
      valueToSave = inputNumberParser(valueToSave);
    }
    update(valueToSave); setInnerValue(newValue);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    handleCellInputKeydown(e, state.actions);
  };

  return (
    <input
      ref={ref} type={'text'} autoComplete={'off'} spellCheck={false}
      value={innerValue} onChange={onChange} onKeyDown={onKeyDown}
    />
  );
};
