import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./en/custom.json";
import translationRU from "./ru/custom.json";


i18n.use(initReactI18next).init({
  lng: 'ru',
  resources: {
    en: {translation: translationEN},
    ru: {translation: translationRU}
  },
  interpolation: {escapeValue: false},
}).then();

export default i18n;
