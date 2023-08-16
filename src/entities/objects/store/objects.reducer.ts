/* --- Action Types --- */

export enum ObjectActionType {
  SET_OBJECTS = 'objects/set',
  SET_TRACE = 'objects/trace',
}

/* --- Action Interfaces --- */

interface ActionSetObjects {
  type: ObjectActionType.SET_OBJECTS,
  payload: ObjectsState,
}
interface ActionSetTrace {
  type: ObjectActionType.SET_TRACE,
  payload: {model?: TraceModel, editing?: boolean, creating?: boolean},
}

export type ObjectsAction = ActionSetObjects | ActionSetTrace;

/* --- Init State & Reducer --- */

const init: ObjectsState = {
  place: {
    channelName: null,
    parameterID: null,
    model: null,
  },
  stratum: {
    channelName: null,
    parameterID: null,
    model: null,
  },
  well: {
    channelName: null,
    parameterID: null,
    model: null,
  },
  trace: {
    channelName: null,
    nodeChannelName: null,
    parameterID: null,
    model: null,
    oldModel: null,
    editing: false,
    creating: false,
  },
};

export function objectsReducer(state: ObjectsState = init, action: ObjectsAction): ObjectsState {
  switch (action.type) {

    case ObjectActionType.SET_TRACE: {
      const traceState = state.trace;
      let { model, editing, creating } = action.payload;

      if (model === undefined) model = traceState.model;
      if (creating === undefined) creating = traceState.creating;
      if (editing === undefined) editing = traceState.editing;

      if (editing && !traceState.editing) {
        traceState.oldModel = creating ? null : structuredClone(model);
      }
      return {...state, trace: {...state.trace, model, creating, editing}};
    }

    case ObjectActionType.SET_OBJECTS: {
      return action.payload;
    }

    default: return state;
  }
}
