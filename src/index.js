import React from "react";
import ReactDOM from "react-dom";

import "./i18n";
import "bootstrap/dist/css/bootstrap.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";


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

ReactDOM.render(<App />, document.getElementById('root'));

registerServiceWorker();
