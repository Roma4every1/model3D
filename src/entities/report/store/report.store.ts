import { create } from 'zustand';


/** Состояние отчётов и программ. */
export const useReportStore = create((): Reports => ({
  models: {},
  operations: [],
  layoutController: null,
}));

/** Список программ и отчётов активной презентации. */
export function useReports(id: ClientID): ReportModel[] {
  return useReportStore(state => state.models[id]);
}
/** Список активных операций. */
export function useOperations(): OperationStatus[] {
  return useReportStore(state => state.operations);
}
