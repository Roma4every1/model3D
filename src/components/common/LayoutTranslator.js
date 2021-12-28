import i18n from '../../i18n';

const translator = (text, parameter) => {
    if (text === "Move: ") {
        return i18n.t('flexlayout.move') + parameter;
    }
    else if (text === "Hidden tabs") {
        return i18n.t('flexlayout.hiddenTabs');
    }
    else if (text === "Restore tabset") {
        return i18n.t('flexlayout.restoreTabset');
    }
    else if (text === "Maximize tabset") {
        return i18n.t('flexlayout.maximizeTabset');
    }
    else if (text === "Close") {
        return i18n.t('flexlayout.close');
    }
    else if (text === "ErroRendering component") {
        return i18n.t('flexlayout.error');
    }
    else {
        if (parameter) {
            return text + parameter;
        }
        else {
            return text;
        }
    }
}

export default translator;
