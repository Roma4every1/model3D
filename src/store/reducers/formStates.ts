/* --- actions types --- */

export enum FormStatesActions {
  SET = 'formStates/set',
  SET_PARAM_VALUE = 'formStates/setParam',
}

/* --- actions interfaces --- */

export interface ActionSet {
  type: FormStatesActions.SET,
  payload: {formID: FormID, state: FormState},
}
export interface ActionSetParamValue {
  type: FormStatesActions.SET_PARAM_VALUE,
  payload: {formID: FormID, paramID: ParameterID, state: ParamState<any>},
}

export type FormStatesAction = ActionSet | ActionSetParamValue;

/* --- reducer --- */

const initFormStatesState: FormStates = {};

export const formStatesReducer = (state: FormStates = initFormStatesState, action: FormStatesAction): FormStates => {
  switch (action.type) {

    case FormStatesActions.SET: {
      const {formID, state: formState} = action.payload
      return {...state, [formID]: formState};
    }

    case FormStatesActions.SET_PARAM_VALUE: {
      const {formID, paramID, state: formState} = action.payload;
      return {...state, [formID]: {...state[formID], [paramID]: formState}};
    }

    default: return state;
  }
}
