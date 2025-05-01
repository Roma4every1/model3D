import type { CSSProperties } from 'react';
import { create } from 'zustand';


/** Хранилище состояний слайд-форм. */
export type SlideStates = Record<FormID, SlideState>;

/** Состояние слайд-формы. */
export interface SlideState {
  /** Библиотека стилей элементов. */
  readonly styles: Record<string, Readonly<CSSProperties>>;
}

export const useSlideStore = create((): SlideStates => ({}));

export function useSlideState(id: FormID): SlideState {
  return useSlideStore(states => states[id]);
}
