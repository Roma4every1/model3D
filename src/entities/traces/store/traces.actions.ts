import {TracesAction, TracesActions} from "./traces.reducer";

/** Добавляет в хранилище новую мультикарту. */
export const createTrace = (currentStratumID: string | null): TracesAction => {
  return {type: TracesActions.CREATE, payload: currentStratumID};
};

export const setCurrentTraceData = (traceData: TraceModel | null): TracesAction => {
  return {type: TracesActions.SET_CURRENT_TRACE, payload: traceData};
};

export const setTraceCreating = (isCreating: boolean): TracesAction => {
  return {type: TracesActions.SET_CREATING, payload: isCreating};
};

export const setTraceEditing = (isEditing: boolean): TracesAction => {
  return {type: TracesActions.SET_EDITING, payload: isEditing};
};

export const setTraceItems = (items: string[]): TracesAction => {
  return {type: TracesActions.SET_ITEMS, payload: items};
};

export const setTraceName = (name: string): TracesAction => {
  return {type: TracesActions.SET_NAME, payload: name};
};
