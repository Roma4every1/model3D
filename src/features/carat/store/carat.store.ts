import { create } from 'zustand';


/** Хранилище каротажных диаграмм. */
export const useCaratStore = create<CaratStates>(() => ({}));

/** Состояние каротажной формы. */
export const useCaratState = (id: FormID) => useCaratStore(state => state[id]);
