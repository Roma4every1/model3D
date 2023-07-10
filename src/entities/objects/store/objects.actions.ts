import { ObjectsAction, ObjectActions } from './objects.reducer';


/** Установить состояние активных объектов. */
export function setObjects(objects: ObjectsState): ObjectsAction {
  return {type: ObjectActions.SET_OBJECTS, payload: objects};
}

/** Установить состояние трассы. */
export function setCurrentTrace(model: TraceModel, creating?: boolean, editing?: boolean): ObjectsAction {
  return {type: ObjectActions.SET_TRACE, payload: {model, creating, editing}};
}
