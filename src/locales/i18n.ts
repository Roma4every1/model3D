import i18n from 'i18next';
import { I18nLabel } from 'flexlayout-react';
import { TFunction, initReactI18next } from 'react-i18next';

import translationEN from './en/custom.json';
import translationRU from './ru/custom.json';


i18n.use(initReactI18next).init({
  lng: 'ru',
  resources: {
    en: {translation: translationEN},
    ru: {translation: translationRU}
  },
  interpolation: {escapeValue: false},
}).then();

export const t: TFunction = i18n.t;

/** Локализация для flex-layout-react. */
export const i18nMapper = (label: I18nLabel, parameter?: string): string => {
  switch (label) {
    case I18nLabel.Close_Tab: return t('layout.close');
    case I18nLabel.Restore: return t('layout.restore');
    case I18nLabel.Maximize: return t('layout.maximize');
    case I18nLabel.Move_Tab: return t('layout.move-tab') + parameter;
    case I18nLabel.Move_Tabset: return t('layout.move-tabset');
    case I18nLabel.Error_rendering_component: return t('layout.error');
    default: return parameter ? label + parameter : label;
  }
};
