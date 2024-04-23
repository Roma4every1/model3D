import { useObjectsStore } from './objects.store';


/** Установить состояние активных объектов. */
export function setObjects(objects: ObjectsState): void {
  useObjectsStore.setState(objects, true);
}

/** Установить состояние трассы. */
export function setCurrentTrace(model: TraceModel, creating?: boolean, editing?: boolean): void {
  const state = useObjectsStore.getState();
  const traceState = state.trace;

  if (model === undefined) model = traceState.model;
  if (creating === undefined) creating = traceState.creating;
  if (editing === undefined) editing = traceState.editing;

  if (editing && !traceState.editing) {
    traceState.oldModel = creating ? null : structuredClone(model);
  }
  useObjectsStore.setState({...state, trace: {...state.trace, model, creating, editing}}, true);
}
