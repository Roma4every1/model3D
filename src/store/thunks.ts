import { Dispatch } from "redux";
import { AppStateAction } from "./reducers/appState";
import {MapsAction} from "./reducers/maps";

import { API } from "../api/api";
import { mapSystem } from "../utils";
import { setWebServicesURL, applyRootLocation } from "../api/initialization";
import { startMapLoad, loadMapSuccess, loadMapError } from "./actionCreators/maps.actions";
import {
  fetchConfigSuccess, fetchConfigError,
  fetchSystemListSuccess, fetchSystemListError,
  startSessionSuccess, startSessionError,
} from "./actionCreators/appState";


export const fetchConfig = () => {
  return async (dispatch: Dispatch<AppStateAction>) => {
    try {
      const config = await API.getClientConfig();
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
      const systemList = await API.getSystemList();
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

export const fetchMapData = (formID: FormID, mapID: MapID, loadMapFn, callback) => {
  return async (dispatch: Dispatch<MapsAction>) => {
    dispatch(startMapLoad(formID));
    const defaultMapContext = {center: {x: 0, y: 0}, scale: 10000};
    try {
      const loadedMap = await loadMapFn(mapID, defaultMapContext);
      callback(loadedMap);
      dispatch(loadMapSuccess(formID, loadedMap));
    } catch (error) {
      console.warn(error);
      dispatch(loadMapError(formID))
    }
  }
}
