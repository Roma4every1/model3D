/* --- Actions Types --- */

export enum CaratsActions {
  ADD = 'carat/add',
  SET = 'carat/set',
}

/* --- Actions Interfaces --- */

interface ActionAdd {
  type: CaratsActions.ADD,
  formID: FormID,
}
interface ActionSet {
  type: CaratsActions.SET,
  formID: FormID,
  payload: HTMLCanvasElement,
}

export type CaratsAction = ActionAdd | ActionSet;

/* --- Reducer --- */

const defaultCaratState: CaratState = {
  columns: [],
  canvas: null,
};

export const caratsReducer = (state: CaratsState = {}, action: CaratsAction): CaratsState => {
  switch (action.type) {

    case CaratsActions.ADD: {
      return {...state, [action.formID]: {...defaultCaratState}};
    }

    case CaratsActions.SET: {
      return {...state, [action.formID]: {...state[action.formID], canvas: action.payload}};
    }

    default: return state;
  }
}
