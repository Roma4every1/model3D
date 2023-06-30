/** Состояние скважины. */
export function wellStateSelector(state: WState): WellState {
  return state.objects.well;
}

/** Состояние трассы. */
export function traceStateSelector(state: WState): TraceState {
  return state.objects.trace;
}

/** Текущее месторождение. */
export function currentPlaceSelector(state: WState): PlaceModel {
  return state.objects.place?.model ?? null;
}

/* --- Specific --- */

/** Нужно ли показывать верхнюю панель с трассами. */
export function needTraceTopTabSelector(state: WState): boolean {
  if (!state.objects.trace?.parameterID) return false;
  const types = state.presentations[state.root.activeChildID]?.childrenTypes;
  return types && (types.has('map') || types.has('carat'));
}

/** Нужно ли показывать правую панель с трассами. */
export function needTraceRightTabSelector(state: WState): boolean {
  return state.objects.trace?.editing === true;
}
