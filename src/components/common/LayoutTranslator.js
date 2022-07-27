import i18n from "../../i18n";


const translator = (text, parameter) => {
  switch (text) {
    case 'Move: ': return i18n.t('flexlayout.move') + parameter;
    case 'Hidden tabs': return i18n.t('flexlayout.hiddenTabs');
    case 'Restore tabset': return i18n.t('flexlayout.restoreTabset');
    case 'Maximize tabset': return i18n.t('flexlayout.maximizeTabset');
    case 'Close': return i18n.t('flexlayout.close');
    case 'ErrorRendering component': return i18n.t('flexlayout.error');

    default: return parameter ? text + parameter : text;
  }
}

export default translator;
