/* --- actions types --- */

export enum FormParamsActions {
  SET = 'params/set',
  ADD = 'params/add',
  ADD_SET = 'params/addSet',
  UPDATE = 'params/update',
  UPDATE_SET = 'params/updateSet',
}

/* --- actions interfaces --- */

export interface ActionSet {
  type: FormParamsActions.SET,
  formId: FormID,
  value: any,
}
export interface ActionAdd {
  type: FormParamsActions.ADD,
  formId: FormID,
  parameter: any,
}
export interface ActionAddSet {
  type: FormParamsActions.ADD_SET,
  set: any,
}
export interface ActionUpdate {
  type: FormParamsActions.UPDATE,
  formId: FormID,
  id: any,
  value: any,
  manual: boolean,
}
export interface ActionUpdateSet {
  type: FormParamsActions.UPDATE_SET,
  formId: FormID,
  values: any,
}

export type FormParamsAction = ActionSet | ActionAdd | ActionAddSet | ActionUpdate | ActionUpdateSet;

/* --- reducer --- */

const initFormParams: FormParams = {};

export const formParamsReducer = (state: FormParams = initFormParams, action: FormParamsAction): FormParams => {
  switch (action.type) {

    case FormParamsActions.SET: {
      const newState = [...action.value];
      if (state[action.formId]) {
        for (let paramId in newState) {
          if (state[action.formId][paramId]) {
            newState[paramId] = state[action.formId][paramId]
          }
        }

        for (let paramId in state[action.formId]) {
          if (!newState[paramId]) {
            newState[paramId] = state[action.formId][paramId]
          }
        }
      }
      return {...state, [action.formId]: newState};
    }

    case FormParamsActions.ADD: {
      if (state[action.formId]) {
        return {...state, [action.formId]: [...state[action.formId], action.parameter]};
      } else {
        return {...state, [action.formId]: [action.parameter]}
      }
    }

    case FormParamsActions.ADD_SET: {
      if (state[action.set.channelName]) {
        return {
            ...state,
            [action.set.channelName]: [...state[action.set.channelName], ...action.set.params]
        };
      } else {
        return {...state, [action.set.channelName]: [...action.set.params]};
      }
    }

    case FormParamsActions.UPDATE: {
      const updatedForm = state[action.formId];
      const updatedParam = updatedForm.find(param => param.id === action.id);

      if (updatedParam) {
        updatedParam.value = action.value;
      } else {
          updatedForm.push({id: action.id, value: action.value, type: "string"});
      }
      return {...state};
    }

    case FormParamsActions.UPDATE_SET: {
      if (state[action.formId]) {
        let newParamsUpdateForm = [...state[action.formId]];

        action.values.forEach(val => {
          const neededParam = newParamsUpdateForm.find(element => element.id === val.name);
          if (neededParam) neededParam.value = val.value;
        });

        return {...state, [action.formId]: [...newParamsUpdateForm]};
      } else {
        return {...state, [action.formId]: [...action.values]};
      }
    }

    default: return state;
  }
}
