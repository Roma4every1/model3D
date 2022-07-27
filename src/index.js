import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import createSessionManager from "./dataManagers/SessionManager";
import registerServiceWorker from "./registerServiceWorker";
import App from "./App";

import "./i18n";
import "bootstrap/dist/css/bootstrap.css";

import { load } from "@progress/kendo-react-intl";
import likelySubtags from "cldr-core/supplemental/likelySubtags.json";
import currencyData from "cldr-core/supplemental/currencyData.json";
import weekData from "cldr-core/supplemental/weekData.json";
import numbers from "cldr-numbers-full/main/ru/numbers.json";
import caGregorian from "cldr-dates-full/main/ru/ca-gregorian.json";
import dateFields from "cldr-dates-full/main/ru/dateFields.json";
import timeZoneNames from "cldr-dates-full/main/ru/timeZoneNames.json";


if (!Object.fromEntries) {
  Object.fromEntries = (entries) => {
    const result = {};
    entries.forEach((entry) => {
      const [key, value] = entry;
      result[key] = value;
    });
    return result;
  }
}

load(
  likelySubtags,
  currencyData,
  weekData,
  numbers,
  caGregorian,
  dateFields,
  timeZoneNames
);

createSessionManager(store);
registerServiceWorker();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
