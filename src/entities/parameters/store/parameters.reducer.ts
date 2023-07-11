/* --- Action Types --- */

export enum ParametersActions {
  SET = 'params/set',
  UPDATE = 'params/update',
  UPDATE_MULTIPLE = 'params/multiple',
  CLEAR = 'params/clear',
}

/* --- Action Interfaces --- */

interface ActionSetDict {
  type: ParametersActions.SET,
  payload: ParamDict,
}
interface ActionUpdate {
  type: ParametersActions.UPDATE,
  payload: UpdateParamData,
}
interface ActionUpdateMultiple {
  type: ParametersActions.UPDATE_MULTIPLE,
  payload: UpdateParamData[],
}
interface ActionClear {
  type: ParametersActions.CLEAR,
  payload: FormID | undefined,
}

export type ParametersAction = ActionSetDict | ActionUpdate | ActionUpdateMultiple | ActionClear;

/* --- Init State & Reducer --- */

const init: ParamDict = {};

export function parametersReducer(state: ParamDict = init, action: ParametersAction): ParamDict {
  switch (action.type) {

    case ParametersActions.SET: {
      return {...state, ...action.payload};
    }

    case ParametersActions.UPDATE: {
      const { clientID, id, value } = action.payload;
      const params = state[clientID];

      const index = params.findIndex(p => p.id === id);
      if (index === -1) return state;

      params[index] = {...params[index], value};
      return {...state, [clientID]: [...params]};
    }

    case ParametersActions.UPDATE_MULTIPLE: {
      for (const { clientID, id, value } of action.payload) {
        const params = state[clientID];
        const index = params.findIndex(p => p.id === id);
        if (index === -1) continue;

        params[index] = {...params[index], value};
        state[clientID] = [...state[clientID]];
      }
      return {...state};
    }

    case ParametersActions.CLEAR: {
      const formID = action.payload;
      if (!formID) return {};
      delete state[formID];
      return {...state};
    }

    default: return state;
  }
}
