/* --- Action Types --- */

export enum ObjectActions {
  SetObjects = 'objects/set',
  SetTrace = 'objects/trace',
}

/* --- Action Interfaces --- */

interface ActionSetObjects {
  type: ObjectActions.SetObjects,
  payload: ObjectsState,
}
interface ActionSetTrace {
  type: ObjectActions.SetTrace,
  payload: {model?: TraceModel, editing?: boolean, creating?: boolean},
}

export type ObjectsAction = ActionSetObjects | ActionSetTrace;

/* --- Init State & Reducer --- */

const init: ObjectsState = {
  place: null,
  well: null,
  trace: null,
};

export function objectsReducer(state: ObjectsState = init, action: ObjectsAction): ObjectsState {
  switch (action.type) {

    case ObjectActions.SetTrace: {
      const traceState = state.trace;
      let { model, editing, creating } = action.payload;

      if (model === undefined) model = traceState.model;
      if (creating === undefined) creating = traceState.creating;
      if (editing === undefined) editing = traceState.editing;
      if (editing === true) state.trace.oldModel = structuredClone(model);
      return {...state, trace: {...state.trace, model, creating, editing}};
    }

    case ObjectActions.SetObjects: {
      return action.payload;
    }

    default: return state;
  }
}
