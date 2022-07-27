import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./components/locales/en/translation.json";
import translationRU from "./components/locales/ru/translation.json";


i18n.use(initReactI18next).init({
  lng: "ru",
  resources: {
    en: {translation: translationEN},
    ru: {translation: translationRU}
  },
  interpolation: {
    escapeValue: false // react already safes from xss
  }
}).then();

export default i18n;
