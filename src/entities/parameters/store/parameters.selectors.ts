import { stringToTableCell } from '../lib/table-row';


/** ID текущей скважины. */
export function currentWellIDSelector(state: WState): string | null {
  const rootFormParams = state.parameters[state.root.id];
  const currentWellParam = rootFormParams.find((param) => {
    return param.id === 'wellCurrent' || param.id === 'currentWell';
  });
  const value = currentWellParam?.value;
  return value ? stringToTableCell(value as string, 'LOOKUPVALUE') : null;
}

/** Plast Code текущего пласта. */
export function currentPlastCodeSelector(state: WState): string | null {
  const rootFormParams = state.parameters[state.root.id];
  const currentWellParam = rootFormParams.find((param) => param.id === 'currentPlast');
  const value = currentWellParam?.value;
  return value ? stringToTableCell(value as string, 'LOOKUPCODE') : null;
}
