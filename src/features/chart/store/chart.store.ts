import type { ChartState } from '../lib/chart.types';
import { create } from 'zustand';


/** Состояния графиков. */
export type ChartStates = Record<FormID, ChartState>;

/** Хранилище графиков. */
export const useChartStore = create((): ChartStates => ({}));

/** Состояние формы графика. */
export function useChartState(id: FormID): ChartState {
  return useChartStore(state => state[id]);
}
