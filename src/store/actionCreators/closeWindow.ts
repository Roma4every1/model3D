import {WindowDataActions, ActionClose} from "../reducers/windowData";


const closeWindow = (): ActionClose => {
  return {type: WindowDataActions.CLOSE};
}

export default closeWindow;
