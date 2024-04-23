import { create } from 'zustand';


/** Хранилище форм просмотра файлов. */
export const useFileViewStore = create<FileViewStates>(() => ({}));

/** Состояние формы просмотра файлов. */
export const useFileViewState = (id: FormID) => useFileViewStore(state => state[id]);
