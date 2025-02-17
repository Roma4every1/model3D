import { create } from 'zustand';


/** Хранилище форм просмотра файлов. */
export const useFileViewStore = create((): Record<FormID, FileViewState> => ({}));

/** Состояние формы просмотра файлов. */
export function useFileViewState(id: FormID): FileViewState {
  return useFileViewStore(state => state[id]);
}
