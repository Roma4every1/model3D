import { create } from 'zustand';


/** Хранилище табличных форм. */
export const useTableStore = create<TableStates>(() => ({}));

/** Состояние табличной формы. */
export const useTableState = (id: FormID) => useTableStore(state => state[id]);
