/* --- Action Types --- */

export enum ParameterActionType {
  SET = 'params/set',
  UPDATE = 'params/update',
  UPDATE_MULTIPLE = 'params/multiple',
}

/* --- Action Interfaces --- */

interface ActionSetDict {
  type: ParameterActionType.SET;
  payload: ParamDict;
}
interface ActionUpdate {
  type: ParameterActionType.UPDATE;
  payload: UpdateParamData;
}
interface ActionUpdateMultiple {
  type: ParameterActionType.UPDATE_MULTIPLE;
  payload: UpdateParamData[];
}

export type ParametersAction = ActionSetDict | ActionUpdate | ActionUpdateMultiple;

/* --- Init State & Reducer --- */

const init: ParamDict = {};

export function parametersReducer(state: ParamDict = init, action: ParametersAction): ParamDict {
  switch (action.type) {

    case ParameterActionType.SET: {
      return {...state, ...action.payload};
    }

    case ParameterActionType.UPDATE: {
      const { clientID, id, value } = action.payload;
      const params = state[clientID];

      const index = params.findIndex(p => p.id === id);
      if (index === -1) return state;

      params[index] = {...params[index], value};
      return {...state, [clientID]: [...params]};
    }

    case ParameterActionType.UPDATE_MULTIPLE: {
      for (const { clientID, id, value } of action.payload) {
        const params = state[clientID];
        const index = params.findIndex(p => p.id === id);
        if (index === -1) continue;

        params[index] = {...params[index], value};
        state[clientID] = [...state[clientID]];
      }
      return {...state};
    }

    default: return state;
  }
}
