import i18n from 'i18next';
import { I18nLabel } from 'flexlayout-react';
import { TFunction, initReactI18next } from 'react-i18next';
import { load, loadMessages } from '@progress/kendo-react-intl';

import likelySubtags from 'cldr-core/supplemental/likelySubtags.json';
import currencyData from 'cldr-core/supplemental/currencyData.json';
import weekData from 'cldr-core/supplemental/weekData.json';
import numbers from 'cldr-numbers-full/main/ru/numbers.json';
import currencies from 'cldr-numbers-full/main/ru/currencies.json';
import caGregorian from 'cldr-dates-full/main/ru/ca-gregorian.json';
import dateFields from 'cldr-dates-full/main/ru/dateFields.json';
import timeZoneNames from 'cldr-dates-full/main/ru/timeZoneNames.json';

import translationRU from './ru/custom.json';
import translationKendoUI from './ru/kendo-ui.json';


i18n.use(initReactI18next).init({
  lng: 'ru',
  resources: {
    ru: {translation: translationRU}
  },
  interpolation: {escapeValue: false},
}).then(() => {
  loadMessages(translationKendoUI, 'ru-RU');
  load(likelySubtags, currencyData, weekData, numbers, currencies, caGregorian, dateFields, timeZoneNames);
});

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
