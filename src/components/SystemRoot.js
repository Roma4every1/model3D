import React from 'react';
import { Provider } from 'react-redux';
import SessionLoader from './SessionLoader';
import createSessionManager from '../dataManagers/SessionManager';
import store from '../store/store';

export default function SystemRoot(props) {

    const { systemName } = props;
    createSessionManager(systemName, store);
    return (
        <Provider store={store}>
            <div className="app">
                <SessionLoader />
            </div>
        </Provider>
    );
}