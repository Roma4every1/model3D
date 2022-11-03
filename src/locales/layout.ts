import i18n from "./i18n";
import { I18nLabel } from "flexlayout-react";


export default function translator(label: I18nLabel, parameter: string): string {
  switch (label) {
    case 'Move: ': return i18n.t('flexlayout.move') + parameter;
    case 'Hidden tabs': return i18n.t('flexlayout.hiddenTabs');
    case 'Move tabset': return 'Переместить вкладку';
    case 'Restore tabset': return i18n.t('flexlayout.restoreTabset');
    case 'Maximize tabset': return i18n.t('flexlayout.maximizeTabset');
    case 'Close': return i18n.t('flexlayout.close');
    default: return parameter ? label + parameter : label;
  }
}
