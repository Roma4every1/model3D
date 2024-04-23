import { create } from 'zustand';


/** Состояние отчётов и программ. */
export const useReportStore = create<Reports>(() => ({
  models: {},
  operations: [],
}));

/** Активные операции. */
export const useOperations = () => useReportStore(state => state.operations);

/** Отчёты для текущей презентации. */
export const useReportModels = (id: ClientID) => useReportStore(state => state.models[id]);
