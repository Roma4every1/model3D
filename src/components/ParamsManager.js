import React from 'react';
import { globals } from './Globals';
var utils = require("../utils");

export default function createParamsManager(sessionId, store) {

    async function loadGlobalParams() {
        const response = await utils.webFetch(`getGlobalParameters?sessionId=${sessionId}`);
        const responseJSON = await response.json();
        globals.globalParameters = responseJSON;
        store.dispatch({ type: 'params/set', value: responseJSON });
    }

    loadGlobalParams();
}