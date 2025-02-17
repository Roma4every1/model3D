import { create } from 'zustand';


/** Хранилище форм списков файлов. */
export const useFileListStore = create((): Record<FormID, Record<never, never>> => ({}));
