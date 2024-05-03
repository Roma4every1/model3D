import { useState } from 'react';


/** Возвращает функцию, при вызове которой компонент заново рендерится. */
export function useRerender(): VoidFunction {
  const [, setSignal] = useState(false);
  return () => setSignal(s => !s);
}
