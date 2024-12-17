import { useState } from 'react';


/** Возвращает функцию, при вызове которой компонент заново рендерится. */
export function useRender(): VoidFunction {
  const [, setSignal] = useState(0);
  return () => setSignal(s => s + 1);
}
