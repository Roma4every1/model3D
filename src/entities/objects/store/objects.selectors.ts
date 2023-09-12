/** Текущее месторождение. */
export function stratumStateSelector(state: WState): StratumState {
  return state.objects.stratum;
}

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
  return state.objects.place.model;
}
