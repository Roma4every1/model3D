import { ObjectsAction, ObjectActions } from './objects.reducer';


/** Установить состояние активных объектов. */
export function setObjects(objects: ObjectsState): ObjectsAction {
  return {type: ObjectActions.SetObjects, payload: objects};
}

/** Установить состояние трассы. */
export function setCurrentTrace(model: TraceModel, creating?: boolean, editing?: boolean): ObjectsAction {
  return {type: ObjectActions.SetTrace, payload: {model, creating, editing}};
}
