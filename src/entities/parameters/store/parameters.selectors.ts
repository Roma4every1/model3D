import { stringToTableCell } from '../lib/table-row';


/** Plast Code текущего пласта. */
export function currentPlastCodeSelector(state: WState): string | null {
  const rootFormParams = state.parameters[state.root.id];
  const currentWellParam = rootFormParams.find((param) => param.id === 'currentPlast');
  const value = currentWellParam?.value;
  return value ? stringToTableCell(value as string, 'LOOKUPCODE') : null;
}
