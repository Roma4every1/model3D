import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './i18n';

function component() {
  const element = document.createElement('div');

  if (!Object.fromEntries) {
    Object.fromEntries = (entries) => {
      var result = {};
      entries.forEach((entry) => {
        var [key, value] = entry;
        result[key] = value;
      });
      return result;
    }
  }

  ReactDOM.render(
    <App />,
  element);

  return element;
}

document.body.appendChild(component());
registerServiceWorker();

