import { create } from 'zustand';
import type { TableStates, TableState } from '../lib/types';


/** Хранилище табличных форм. */
export const useTableStore = create((): TableStates => ({}));

/** Состояние табличной формы. */
export function useTableState(id: FormID): TableState {
  return useTableStore(state => state[id]);
}
