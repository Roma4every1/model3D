/* --- Action Types --- */

export enum FormParamsActions {
  SET = 'params/set',
  SET_DICT = 'params/dict',
  ADD = 'params/add',
  UPDATE = 'params/update',
  CLEAR = 'params/clear',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: FormParamsActions.SET,
  payload: {formID: FormID, params: FormParameter[]}
}
interface ActionSetDict {
  type: FormParamsActions.SET_DICT,
  payload: ParamDict,
}
interface ActionAdd {
  type: FormParamsActions.ADD,
  payload: {formID: FormID, parameter: FormParameter},
}
interface ActionUpdate {
  type: FormParamsActions.UPDATE,
  payload: {formID: FormID, id: ParameterID, value: any}
}
interface ActionClear {
  type: FormParamsActions.CLEAR,
  payload: FormID | undefined,
}

export type FormParamsAction = ActionSet | ActionSetDict | ActionAdd | ActionUpdate | ActionClear;

/* --- Init State & Reducer --- */

const init: ParamDict = {};

export const parametersReducer = (state: ParamDict = init, action: FormParamsAction): ParamDict => {
  switch (action.type) {

    case FormParamsActions.SET: {
      const { formID, params: newState } = action.payload;
      if (state[formID]) {
        for (let paramID in newState) {
          if (state[formID][paramID]) newState[paramID] = state[formID][paramID];
        }
        for (let paramID in state[formID]) {
          if (!newState[paramID]) newState[paramID] = state[formID][paramID];
        }
      }
      return {...state, [formID]: newState};
    }

    case FormParamsActions.SET_DICT: {
      return {...state, ...action.payload};
    }

    case FormParamsActions.ADD: {
      const { formID, parameter } = action.payload;
      if (state[formID]) {
        return {...state, [formID]: [...state[formID], parameter]};
      } else {
        return {...state, [formID]: [parameter]}
      }
    }

    case FormParamsActions.UPDATE: {
      const { id, value, formID } = action.payload;
      const updatedParam = state[formID].find(param => param.id === id);
      if (updatedParam) updatedParam.value = value;
      return {...state};
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
