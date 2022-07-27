import { Dispatch } from "redux";
import { AppStateAction } from "./reducers/appState";

import { mapSystem } from "../utils";
import { setWebServicesURL, applyRootLocation } from "../initialization";
import { getClientConfig, getSystemList } from "../api/init";
import {
  fetchConfigSuccess, fetchConfigError,
  fetchSystemListSuccess, fetchSystemListError,
  startSessionSuccess, startSessionError,
} from "./actionCreators/appState";


export const fetchConfig = () => {
  return async (dispatch: Dispatch<AppStateAction>) => {
    try {
      const config = await getClientConfig();
      setWebServicesURL(config);
      applyRootLocation(config);
      dispatch(fetchConfigSuccess(config));
    } catch (error) {
      console.warn(error);
      dispatch(fetchConfigError());
    }
  }
}

export const fetchSystems = () => {
  return async (dispatch: Dispatch<AppStateAction>) => {
    try {
      const systemList = await getSystemList();
      dispatch(fetchSystemListSuccess(systemList.map(mapSystem)));
    } catch (error) {
      console.warn(error);
      dispatch(fetchSystemListError());
    }
  }
}

export const startSession = (startSessionFn) => {
  return async (dispatch: Dispatch<AppStateAction>) => {
    try {
      const sessionID = await startSessionFn();
      sessionID
        ? dispatch(startSessionSuccess(sessionID))
        : dispatch(startSessionError());
    } catch (error) {
      console.warn(error);
      dispatch(startSessionError());
    }
  }
}
