import {WindowDataActions, ActionSetWarning} from "../reducers/windowData";


const setWindowWarning = (text, stackTrace = null, header = null, fileToSaveName = null): ActionSetWarning => {
  return {type: WindowDataActions.SET_WARNING, header, text, stackTrace, fileToSaveName};
}

export default setWindowWarning;
