import React from 'react';
import { Provider } from 'react-redux';
import store from './store/store';
import '@progress/kendo-theme-default/dist/all.css';
import 'flexlayout-react/style/light.css';
import './custom.css'
import createSessionManager from './dataManagers/SessionManager';
import SessionLoader from './components/SessionLoader';

export default function App() {
    createSessionManager('DEMO_SYSTEM', store);

    return (
        <Provider store={store}>
            <div className="app">
                <SessionLoader/>
            </div>
        </Provider>
    );
}
