import React from 'react';
import { Provider } from 'react-redux';
import store from './store/store';
import '@progress/kendo-theme-default/dist/all.css';
import 'flexlayout-react/style/light.css';
import './custom.css'
import createSessionManager from './dataManagers/SessionManager';
import SessionLoader from './components/SessionLoader';
const WMWSystemName = process.env.WMWSYSTEMNAME;

export default function App() {
 //   createSessionManager('DEMO_SYSTEM', store);
 //   createSessionManager('OPR_REG_SYSTEM_CONS', store);
   createSessionManager(WMWSystemName, store);

    return (
        <Provider store={store}>
            <div className="app">
                <SessionLoader/>
            </div>
        </Provider>
    );
}
