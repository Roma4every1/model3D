import { Dispatch } from "redux";
import { AppStateAction } from "./reducers/appState";
import { MapsAction } from "./reducers/maps";
import { PresentationsAction } from "./reducers/presentations";
import { ProgramsAction } from "./reducers/programs";

import { API } from "../api/api";
import { mapSystem } from "../utils";
import { setWebServicesURL, applyRootLocation } from "../api/initialization";
import { startMapLoad, loadMapSuccess, loadMapError } from "./actionCreators/maps.actions";
import { fetchPresentationsStart, fetchPresentationsEnd } from "./actionCreators/presentations.actions";
import { fetchProgramsStart, fetchProgramsEndSuccess, fetchProgramsEndError } from "./actionCreators/programs.actions";
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

export const fetchMapData = (formID: FormID, mapID: MapID, loadMapFn) => {
  return async (dispatch: Dispatch<MapsAction>) => {
    dispatch(startMapLoad(formID));
    const defaultMapContext = {center: {x: 0, y: 0}, scale: 10000};
    try {
      const loadedMap = await loadMapFn(mapID, defaultMapContext);
      dispatch(loadMapSuccess(formID, loadedMap));
    } catch (error) {
      console.warn(error);
      dispatch(loadMapError(formID))
    }
  }
}

export const fetchPresentations = (sessionManager, sessionID: SessionID, formID: FormID, activeChild) => {
  const setActive = (data: PresentationItem) => {
    if (data.id === activeChild) {
      data.selected = true;
      return true;
    }
    if (data.items) {
      data.items.forEach(item => {
        if (setActive(item)) data.expanded = true;
      });
    }
  };
  return async (dispatch: Dispatch<PresentationsAction>) => {
    try {
      dispatch(fetchPresentationsStart());
      const path = `presentationList?sessionId=${sessionID}&formId=${formID}`;
      const data = await sessionManager.fetchData(path);
      setActive(data);
      dispatch(fetchPresentationsEnd(data));
    } catch (error) {
      console.warn(error);
      dispatch(fetchPresentationsEnd(error.message));
    }
  }
}

export const fetchFormPrograms = (formID: FormID, sessionManager, sessionID: SessionID) => {
  return async (dispatch: Dispatch<ProgramsAction>) => {
    try {
      dispatch(fetchProgramsStart(formID));

      const programListPath = `programsList?sessionId=${sessionID}&formId=${formID}`;
      const data: ProgramListData = await sessionManager.fetchData(programListPath);

      for (const program of data) {
        if (program.needCheckVisibility === false) {
          program.visible = true; continue;
        }

        const params = program.paramsForCheckVisibility;
        try {
          const paramValues = sessionManager.paramsManager.getParameterValues(params, formID, false)
          const body = {sessionId: sessionID, reportId: program.id, paramValues};
          const requestInit: RequestInit = {method: 'POST', body: JSON.stringify(body)};
          const visible = await sessionManager.fetchData('programVisibility', requestInit);
          program.visible = visible === 'true';
        } catch {
          program.visible = false;
        }
      }
      dispatch(fetchProgramsEndSuccess(formID, data));
    } catch (error) {
      console.warn(error);
      dispatch(fetchProgramsEndError(formID, error.message));
    }
  }
}
