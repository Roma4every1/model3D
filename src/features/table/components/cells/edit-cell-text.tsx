import { CellActions } from '../../lib/types';
import { EditCellProps } from './base-edit-cell';
import { ChangeEvent, KeyboardEvent, useState, useEffect, useRef } from 'react';


export interface EditCellMetadata {
  regex?: RegExp,
  parse?: (str: string) => number,
}


/** Редактор числовой или текстовой ячейки. */
export function EditCellTextInput(this: EditCellMetadata, props: EditCellProps<number | string>) {
  const { regex, parse } = this;
  const ref = useRef<HTMLInputElement>();
  const [innerValue, setInnerValue] = useState(props.value?.toString() ?? '');

  useEffect(() => {
    ref.current.focus();
    ref.current.select();
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!regex || !newValue || regex.test(newValue) || newValue === '-') setInnerValue(newValue);
  };

  const update = () => {
    let valueToSave: any = innerValue;
    if (!innerValue.length) {
      valueToSave = null;
    } else if (parse) {
      valueToSave = parse(valueToSave);
      if (isNaN(valueToSave)) valueToSave = null;
    }
    props.update(valueToSave);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const key = e.nativeEvent.key;
    if (parse && key === '-' && innerValue.length && innerValue !== '-') {
      setInnerValue((-1 * parse(innerValue)).toString())
    } else {
      handeEditKeyboardEvent(key, e.target as HTMLInputElement, props.actions, update);
    }
  };

  return (
    <input
      type={'text'} className={'active-cell-editor'}
      value={innerValue} ref={ref}
      onChange={onChange} onBlur={update} onKeyDown={onKeyDown}
      autoComplete={'off'} spellCheck={false}
    />
  );
}

function handeEditKeyboardEvent(key: string, target: HTMLInputElement, actions: CellActions, update: () => void) {
  if (key === 'Enter') return update();

  if (key.startsWith('Arrow')) {
    if (key.endsWith('Up') || key.endsWith('Down')) return update();
    const { selectionStart, selectionEnd } = target;
    if (selectionStart !== selectionEnd) return;

    if (key.endsWith('Left') && selectionStart === 0) {
      update(); actions.moveCellHorizontal(-1);
    } else if (key.endsWith('Right') && selectionEnd === target.value.length) {
      update(); actions.moveCellHorizontal(1);
    }
  }
}
