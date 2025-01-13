import i18n from 'i18next';
import { I18nLabel } from 'flexlayout-react';
import { TFunction, initReactI18next } from 'react-i18next';
import { load, loadMessages } from '@progress/kendo-react-intl';

import ru_RU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

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

dayjs.locale('ru');

export { ru_RU };
export const t: TFunction = i18n.t;

/** Локализация для flex-layout-react. */
export function i18nMapper(label: I18nLabel, parameter?: string): string {
  switch (label) {
    case I18nLabel.Close_Tab: return t('layout.close');
    case I18nLabel.Restore: return t('layout.restore');
    case I18nLabel.Maximize: return t('layout.maximize');
    case I18nLabel.Move_Tab: return t('layout.move-tab') + parameter;
    case I18nLabel.Move_Tabset: return t('layout.move-tabset');
    case I18nLabel.Error_rendering_component: return t('layout.error');
    default: return parameter ? label + parameter : label;
  }
}

/**
 * Парсер для редактора целого числа.
 *
 * В качестве разделителя дробной части поддерживается и точка, и запятая.
 * Если строка не является записью числа, будет возвращён `null`.
 * Дробные числа округляются до ближайшего целого.
 */
export function inputIntParser(value: string): number | null {
  if (!value) return null;
  const number = Number(value.replace(',', '.'));
  return Number.isNaN(number) ? null : Math.round(number);
}

/**
 * Парсер для редактора числа.
 *
 * В качестве разделителя дробной части поддерживается и точка, и запятая.
 * Если строка не является записью числа, будет возвращён `null`.
 */
export function inputNumberParser(value: string): number | null {
  if (!value) return null;
  const number = Number(value.replace(',', '.'));
  return Number.isNaN(number) ? null : number;
}

/**
 * Функция форматирования числа в поле для ввода.
 *
 * Текст остаётся без изменений, пока пользователь печатает.
 * После окончания редактирования убираются лишние нули и/или разделитель.
 * Если текст не является записью числа, поле для ввода очищается.
 */
export function inputNumberFormatter(value: number | string, info: {input: string, userTyping: boolean}): string {
  let input = info.input;
  if (info.userTyping === true) return input;
  if (value === '') return value;

  if (Number(input.replace(',', '.')) !== Number(value)) {
    return input.includes(',') ? (value as string).replace('.', ',') : value as string;
  }
  const prefixZeroMatch = input.match(/^([+-]?)(?:0+[1-9]|(0{2,})[.,])/);
  if (prefixZeroMatch) {
    const [match, sign, zeros] = prefixZeroMatch;
    if (zeros) {
      input = sign + '0' + input.substring(match.length - 1);
    } else {
      input = sign + input.substring(match.length - 1);
    }
  }
  const lastCharIndex = input.length - 1;
  const lastCharCode = input.charCodeAt(lastCharIndex);

  if (lastCharCode === 0x2E /* . */ || lastCharCode === 0x2C /* , */) {
    input = input.substring(0, lastCharIndex);
  }
  return input;
}
