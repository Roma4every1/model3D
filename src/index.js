import React from "react";
import ReactDOM from "react-dom";

import thunk from "redux-thunk";
import { Provider } from "react-redux";
import { createStore , applyMiddleware } from "redux";
import { rootReducer } from "./store";

import createSessionManager from "./data-managers/session-manager";
import registerServiceWorker from "./service-worker";
import App from "./components/app";

import "./locales/i18n";
import "bootstrap/dist/css/bootstrap.css";

import { load, loadMessages } from "@progress/kendo-react-intl";
import ruMessages from "./locales/ru/kendo-ui.json";
import likelySubtags from "cldr-core/supplemental/likelySubtags.json";
import currencyData from "cldr-core/supplemental/currencyData.json";
import weekData from "cldr-core/supplemental/weekData.json";
import numbers from "cldr-numbers-full/main/ru/numbers.json";
import currencies from "cldr-numbers-full/main/ru/currencies.json";
import caGregorian from "cldr-dates-full/main/ru/ca-gregorian.json";
import dateFields from "cldr-dates-full/main/ru/dateFields.json";
import timeZoneNames from "cldr-dates-full/main/ru/timeZoneNames.json";


loadMessages(ruMessages, 'ru-RU');
load(likelySubtags, currencyData, weekData, numbers, currencies, caGregorian, dateFields, timeZoneNames);

try { registerServiceWorker(); } catch {}

const store = createStore(rootReducer, applyMiddleware(thunk));
createSessionManager(store);

const root = document.getElementById('root');
ReactDOM.render(<Provider store={store}><App /></Provider>, root);
