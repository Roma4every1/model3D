import {TracesAction, TracesActions} from "./traces.reducer";

/** Добавляет в хранилище новую трассу. */
export const createTrace = (currentStratumID: string | null): TracesAction => {
  return {type: TracesActions.CREATE, payload: currentStratumID};
};

/** Устанавливает в хранилище значение выбранной трассы. */
export const setCurrentTraceData = (traceData: TraceModel | null): TracesAction => {
  return {type: TracesActions.SET_CURRENT_TRACE, payload: traceData};
};

/** Устанавливает в хранилище значение состояния создания трассы. */
export const setTraceCreating = (isCreating: boolean): TracesAction => {
  return {type: TracesActions.SET_CREATING, payload: isCreating};
};

/** Устанавливает в хранилище значение состояния редактирования трассы. */
export const setTraceEditing = (isEditing: boolean): TracesAction => {
  return {type: TracesActions.SET_EDITING, payload: isEditing};
};

/** Устанавливает в хранилище значение узлов трассы. */
export const setTraceItems = (items: string[]): TracesAction => {
  return {type: TracesActions.SET_ITEMS, payload: items};
};

/** Устанавливает в хранилище значение имени трассы. */
export const setTraceName = (name: string): TracesAction => {
  return {type: TracesActions.SET_NAME, payload: name};
};
