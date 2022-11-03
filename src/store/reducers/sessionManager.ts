/* --- actions types --- */

export enum SessionManagerActions {
  SET = 'sessionManager/set',
}

/* --- actions interfaces --- */

export interface ActionSet {
  type: SessionManagerActions.SET,
  value: SessionManager,
}

export type SessionManagerAction = ActionSet;

/* --- reducer --- */

const init = null;

export const sessionManagerReducer = (state: SessionManager = init, action: SessionManagerAction): SessionManager => {
  switch (action.type) {

    case SessionManagerActions.SET: {
      return action.value;
    }

    default: return state;
  }
}
