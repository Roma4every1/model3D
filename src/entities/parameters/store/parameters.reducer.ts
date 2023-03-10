/* --- Action Types --- */

export enum FormParamsActions {
  SET = 'params/set',
  UPDATE = 'params/update',
  CLEAR = 'params/clear',
}

/* --- Action Interfaces --- */

interface ActionSetDict {
  type: FormParamsActions.SET,
  payload: ParamDict,
}
interface ActionUpdate {
  type: FormParamsActions.UPDATE,
  payload: {clientID: FormID, id: ParameterID, value: any}
}
interface ActionClear {
  type: FormParamsActions.CLEAR,
  payload: FormID | undefined,
}

export type FormParamsAction = ActionSetDict | ActionUpdate | ActionClear;

/* --- Init State & Reducer --- */

const init: ParamDict = {};

export const parametersReducer = (state: ParamDict = init, action: FormParamsAction): ParamDict => {
  switch (action.type) {

    case FormParamsActions.SET: {
      return {...state, ...action.payload};
    }

    case FormParamsActions.UPDATE: {
      const { clientID, id, value } = action.payload;
      const params = state[clientID];

      const index = params.findIndex(param => param.id === id);
      if (index === -1) return state;

      params[index] = {...params[index], value};
      return {...state, [clientID]: [...params]};
    }

    case FormParamsActions.CLEAR: {
      const formID = action.payload;
      if (!formID) return {};
      delete state[formID];
      return {...state};
    }

    default: return state;
  }
};
