import {SessionManagerActions, ActionSet} from "../reducers/sessionManager";


const setSessionManager = (value): ActionSet => {
  return {type: SessionManagerActions.SET, value};
}

export default setSessionManager;
