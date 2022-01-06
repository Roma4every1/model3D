import React from 'react';
import { Provider } from 'react-redux';
import SessionLoader from './SessionLoader';
import createSessionManager from '../dataManagers/SessionManager';
import store from '../store/store';

export default function SystemRoot() {

    var pathString = String(window.location.pathname);
    const systemName = pathString.slice(pathString.lastIndexOf("/") + 1);
    createSessionManager(systemName, store);
    return (
        <Provider store={store}>
            <div className="app">
                <SessionLoader />
            </div>
        </Provider>
    );
}