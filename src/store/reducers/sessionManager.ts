/* --- actions types --- */

export enum SessionManagerActions {
  SET = 'sessionManager/set',
}

/* --- actions interfaces --- */

export interface ActionSet {
  type: SessionManagerActions.SET,
  value: any,
}

export type SessionManagerAction = ActionSet;

/* --- reducer --- */

const initSessionManager = null;

export const sessionManager = (state = initSessionManager, action: SessionManagerAction) => {
  switch (action.type) {

    case SessionManagerActions.SET: {
      return action.value;
    }

    default: return state;
  }
}
