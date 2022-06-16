import {WindowDataActions, ActionSetError} from "../reducers/windowData";


const setWindowError = (text, stackTrace = null, header = null, fileToSaveName = null): ActionSetError => {
  return {type: WindowDataActions.SET_ERROR, header, text, stackTrace, fileToSaveName};
}

export default setWindowError;
