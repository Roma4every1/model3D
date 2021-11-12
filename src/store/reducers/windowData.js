import SETERROR from '../actions/windowData/setError';
import SETINFO from '../actions/windowData/setInfo';
import SETWARNING from '../actions/windowData/setWarning';
import CLOSE from '../actions/windowData/close';
import i18n from '../../i18n';

function windowData(state = null, action) {
    switch (action.type) {
        case SETERROR: return {
            opened: true,
            header: action.header ?? i18n.t('base.error'),
            text: action.text,
            stackTrace: action.stackTrace,
            type: "error"
        };

        case SETINFO: return {
            opened: true,
            header: action.header ?? i18n.t('base.info'),
            text: action.text,
            stackTrace: action.stackTrace,
            type: "info"
        };

        case SETWARNING: return {
            opened: true,
            header: action.header ?? i18n.t('base.warning'),
            text: action.text,
            stackTrace: action.stackTrace,
            type: "warning"
        };

        case CLOSE: return {
            opened: false
        };

        default: return state;
    }
}

export default windowData;