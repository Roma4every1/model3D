import {SessionIDActions, ActionSet} from "../reducers/sessionId";


const setSessionId = (value: SessionID): ActionSet => {
  return {type: SessionIDActions.SET, value};
}

export default setSessionId;
