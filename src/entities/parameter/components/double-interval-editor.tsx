import { useRef, useState } from 'react';
import { EditorProps } from './editor-dict';
import { InputNumber } from 'antd';
import { inputNumberParser } from 'shared/locales';


/** Редактор параметра типа `doubleInterval`. */
export const DoubleIntervalEditor = ({parameter, update}: EditorProps<'doubleInterval'>) => {
  const parameterValue = parameter.getValue();
  const disabled = parameter.editor.disabled;

  const timerRef = useRef<number>();
  const [startValue, setStartValue] = useState(parameterValue?.at(0) ?? null);
  const [endValue, setEndValue] = useState(parameterValue?.at(1) ?? null);

  const debounceUpdate = (start: number | null, end: number | null) => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(update, 750, [start, end]);
  };

  const onStartChange = (value: number | null) => {
    if (value !== null) {
      if (endValue !== null && value > endValue) {
        setStartValue(value);
        debounceUpdate(endValue, endValue);
      } else {
        setStartValue(value);
        debounceUpdate(value, endValue);
      }
    } else {
      setStartValue(null)
      debounceUpdate(null, endValue);
    }
  };

  const onEndChange = (value: number | null) => {
    if (value !== null) {
      if (startValue !== null && value < startValue) {
        setEndValue(value);
        debounceUpdate(startValue, startValue);
      } else {
        setEndValue(value);
        debounceUpdate(startValue, value);
      }
    } else {
      setEndValue(null);
      debounceUpdate(startValue, null);
    }
  };

  const onStartBlur = () => {
    if (startValue !== null && endValue !== null && startValue > endValue) setStartValue(endValue);
  };
  const onEndBlur = () => {
    if (startValue !== null && endValue !== null && endValue < startValue) setEndValue(startValue);
  };

  return (
    <div className={'double-interval-editor'}>
      <InputNumber
        value={startValue} onChange={onStartChange} onBlur={onStartBlur}
        parser={inputNumberParser} disabled={disabled} changeOnWheel={true} controls={false}
      />
      <InputNumber
        value={endValue} onChange={onEndChange} onBlur={onEndBlur}
        parser={inputNumberParser} disabled={disabled} changeOnWheel={true} controls={false}
      />
    </div>
  );
};
