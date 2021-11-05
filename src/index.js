import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './i18n';

function component() {
  const element = document.createElement('div');

  ReactDOM.render(
    <App />,
  element);

  return element;
}

document.body.appendChild(component());
registerServiceWorker();

