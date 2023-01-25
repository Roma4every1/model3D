/* --- Action Types --- */

export enum FormParamsActions {
  SET = 'params/set',
  ADD = 'params/add',
  ADD_SET = 'params/addSet',
  UPDATE = 'params/update',
  UPDATE_SET = 'params/updateSet',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: FormParamsActions.SET,
  formID: FormID,
  value: any,
}
interface ActionAdd {
  type: FormParamsActions.ADD,
  formID: FormID,
  parameter: FormParameter,
}
interface ActionAddSet {
  type: FormParamsActions.ADD_SET,
  set: any,
}
interface ActionUpdate {
  type: FormParamsActions.UPDATE,
  formID: FormID,
  id: ParameterID,
  value: any,
}
interface ActionUpdateSet {
  type: FormParamsActions.UPDATE_SET,
  formID: FormID,
  values: any,
}

export type FormParamsAction = ActionSet | ActionAdd | ActionAddSet | ActionUpdate | ActionUpdateSet;

/* --- Init State & Reducer --- */

const init: FormParams = {};

export const formParamsReducer = (state: FormParams = init, action: FormParamsAction): FormParams => {
  switch (action.type) {

    case FormParamsActions.SET: {
      const formID = action.formID;
      const newState = [...action.value];

      if (state[formID]) {
        for (let paramID in newState) {
          if (state[formID][paramID]) newState[paramID] = state[formID][paramID]
        }
        for (let paramID in state[formID]) {
          if (!newState[paramID]) newState[paramID] = state[formID][paramID]
        }
      }
      return {...state, [formID]: newState};
    }

    case FormParamsActions.ADD: {
      const { formID, parameter } = action;
      if (state[formID]) {
        return {...state, [formID]: [...state[formID], parameter]};
      } else {
        return {...state, [formID]: [parameter]}
      }
    }

    case FormParamsActions.ADD_SET: {
      const { channelName, params } = action.set;
      if (state[channelName]) {
        return {...state, [channelName]: [...state[channelName], ...params]};
      } else {
        return {...state, [channelName]: [...params]};
      }
    }

    case FormParamsActions.UPDATE: {
      const { id, value, formID } = action;
      const updatedForm = state[formID];
      const updatedParam = updatedForm.find(param => param.id === id);

      if (updatedParam) {
        updatedParam.value = action.value;
      } else {
        const param: FormParameter = {type: 'string', id, value, formID, dependsOn: null};
        updatedForm.push(param);
      }
      return {...state};
    }

    case FormParamsActions.UPDATE_SET: {
      const formID = action.formID;
      if (state[formID]) {
        const newParamsUpdateForm = [...state[formID]];

        action.values.forEach(val => {
          const neededParam = newParamsUpdateForm.find(element => element.id === val.name);
          if (neededParam) neededParam.value = val.value;
        });

        return {...state, [formID]: [...newParamsUpdateForm]};
      } else {
        return {...state, [formID]: [...action.values]};
      }
    }

    default: return state;
  }
};
