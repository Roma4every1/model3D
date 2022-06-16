/* --- actions types --- */

export enum LayoutActions {
  SET = 'layout/set',
}

/* --- actions interfaces --- */

export interface ActionSet {
  type: LayoutActions.SET,
  formId: FormID,
  value: any,
}

export type LayoutAction = ActionSet;

/* --- reducer --- */

const initLayout: FormsLayout = {};

export const layout = (state: FormsLayout = initLayout, action: LayoutAction): FormsLayout => {
  switch (action.type) {

    case LayoutActions.SET: {
      return {...state, [action.formId]: action.value};
    }

    default: return state;
  }
}
