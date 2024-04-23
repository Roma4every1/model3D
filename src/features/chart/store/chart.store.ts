import { create } from 'zustand';


/** Хранилище графиков. */
export const useChartStore = create<ChartStates>(() => ({}));

/** Состояние формы графика. */
export const useChartState = (id: FormID) => useChartStore(state => state[id]);
