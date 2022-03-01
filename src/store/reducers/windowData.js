import SETERROR from '../actions/windowData/setError';
import SETINFO from '../actions/windowData/setInfo';
import SETOPENEDWINDOW from '../actions/windowData/setOpenedWindow';
import SETWARNING from '../actions/windowData/setWarning';
import CLOSE from '../actions/windowData/close';
import i18n from '../../i18n';

function windowData(state = null, action) {
    let newState = { ...state };
    switch (action.type) {
        case SETOPENEDWINDOW:
            newState.windows = { ...newState.windows };
            newState.windows[action.windowName] = {
                visible: action.windowVisible,
                window: action.window,
                position: action.position ?? newState.windows[action.windowName]?.position
            };
            return newState;

        case SETERROR:
            newState.messageWindow = {
                opened: true,
                header: action.header ?? i18n.t('base.error'),
                text: action.text,
                stackTrace: action.stackTrace,
                fileToSaveName: action.fileToSaveName,
                type: "error"
            }
            return newState;

        case SETINFO:
            newState.messageWindow = {
                opened: true,
                header: action.header ?? i18n.t('base.info'),
                text: action.text,
                stackTrace: action.stackTrace,
                fileToSaveName: action.fileToSaveName,
                type: "info"
            }
            return newState;

        case SETWARNING:
            newState.messageWindow = {
                opened: true,
                header: action.header ?? i18n.t('base.warning'),
                text: action.text,
                stackTrace: action.stackTrace,
                fileToSaveName: action.fileToSaveName,
                type: "warning"
            }
            return newState;

        case CLOSE:
            newState.messageWindow = {
                opened: false
            }
            return newState;

        default: return state;
    }
}

export default windowData;