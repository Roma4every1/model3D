

/* --- Action Types --- */

export enum TracesActions {
  CREATE = 'traces/create',
  SET_CURRENT_TRACE = 'traces/setTrace',
  SET_EDITING = 'traces/editing',
  SET_CREATING = 'traces/creating',
  SET_ITEMS = 'traces/items',
  SET_NAME = 'traces/name',
}

/* --- Action Interfaces --- */

interface ActionCreate {
  type: TracesActions.CREATE,
  payload: string | null,
}

interface ActionSetTrace {
  type: TracesActions.SET_CURRENT_TRACE,
  payload: TraceModel | null,
}

interface ActionSetEditing {
  type: TracesActions.SET_EDITING,
  payload: boolean,
}

interface ActionSetCreating {
  type: TracesActions.SET_CREATING,
  payload: boolean,
}

interface ActionSetItems {
  type: TracesActions.SET_ITEMS,
  payload: string[],
}

interface ActionSetName {
  type: TracesActions.SET_NAME,
  payload: string,
}

export type TracesAction = ActionCreate | ActionSetItems | ActionSetName | ActionSetTrace |
  ActionSetEditing | ActionSetCreating;

/* --- Init State & Reducer --- */

const init: TracesState = {
  currentTraceData: null,
  oldTraceData: null,
  isTraceEditing: false,
  isTraceCreating: false
};

export const tracesReducer = (state: TracesState = init, action: TracesAction): TracesState => {
  switch (action.type) {
    case TracesActions.CREATE: {
      return {...state,
        isTraceCreating: true,
        isTraceEditing: true,
        currentTraceData: {
          id: null,
          name: "Без имени",
          stratumID: action.payload,
          items: null
        }};
    }

    case TracesActions.SET_CURRENT_TRACE: {
      return {...state, currentTraceData: action.payload};
    }

    case TracesActions.SET_CREATING: {
      return {...state, isTraceCreating: action.payload};
    }

    case TracesActions.SET_EDITING: {
      const isTraceEditing = action.payload;
      const oldTraceData = isTraceEditing ? state.currentTraceData : null;
      return {...state,
        isTraceEditing,
        oldTraceData
      };
    }

    case TracesActions.SET_ITEMS: {
      const currentData = state.currentTraceData
      return {...state, currentTraceData: {
          ...currentData, items: action.payload
        }};
    }

    case TracesActions.SET_NAME: {
      const currentData = state.currentTraceData
      return {...state, currentTraceData: {
          ...currentData, name: action.payload
        }};
    }

    default: return state;
  }
};
