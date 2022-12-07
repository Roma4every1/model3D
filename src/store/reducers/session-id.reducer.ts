/* --- actions types --- */

export enum SessionIDActions {
  SET = 'sessionID/SET',
}

/* --- actions interfaces --- */

export interface ActionSet {
  type: SessionIDActions.SET,
  value: SessionID,
}

export type SessionIDAction = ActionSet;

/* --- reducer --- */

const initSessionID: SessionID = '';

export const sessionIdReducer = (state: SessionID = initSessionID, action: SessionIDAction): SessionID => {
  switch (action.type) {

    case SessionIDActions.SET: {
      return action.value;
    }

    default: return state;
  }
}
