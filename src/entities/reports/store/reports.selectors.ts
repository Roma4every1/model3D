/** Состояние отчётов и программ. */
export function reportsSelector(state: WState): Reports {
  return state.reports;
}

/** Активные операции. */
export function operationsSelector(state: WState): OperationStatus[] {
  return state.reports.operations;
}

/** Отчёты для текущей презентации. */
export function reportModelsSelector(this: FormID, state: WState): ReportModel[] {
  return state.reports.models[this];
}
