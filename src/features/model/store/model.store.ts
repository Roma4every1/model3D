// model/store/model.store.ts
import { create } from 'zustand';
import type { ModelState } from '../model.d';

/** Хранилище состояний 3D-моделей. */
export const useModelStore = create((): Record<FormID, ModelState> => ({}));

export const useModelState = (id: FormID) => useModelStore(state => state[id]);
