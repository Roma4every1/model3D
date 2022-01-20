import React from 'react';
import { Provider } from 'react-redux';
import SessionLoader from './SessionLoader';
import createSessionManager from '../dataManagers/SessionManager';
import store from '../store/store';
import {
    load,
} from "@progress/kendo-react-intl";
import likelySubtags from "cldr-core/supplemental/likelySubtags.json";
import currencyData from "cldr-core/supplemental/currencyData.json";
import weekData from "cldr-core/supplemental/weekData.json";
import numbers from "cldr-numbers-full/main/ru/numbers.json";
import caGregorian from "cldr-dates-full/main/ru/ca-gregorian.json";
import dateFields from "cldr-dates-full/main/ru/dateFields.json";
import timeZoneNames from "cldr-dates-full/main/ru/timeZoneNames.json";
load(
    likelySubtags,
    currencyData,
    weekData,
    numbers,
    caGregorian,
    dateFields,
    timeZoneNames
);

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