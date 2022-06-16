import {WindowDataActions, ActionSetInfo} from "../reducers/windowData";


const setWindowInfo = (text, stackTrace = null, header = null, fileToSaveName = null): ActionSetInfo => {
  return {type: WindowDataActions.SET_INFO, header, text, stackTrace, fileToSaveName};
}

export default setWindowInfo;
