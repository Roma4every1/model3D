import { WDispatch } from "./index";
import { API } from "../api/api";
import { mapSystem } from "../utils";
import { setWebServicesURL, applyRootLocation } from "../api/initialization";
import { actions } from "./index";


export const fetchConfig = () => {
  return async (dispatch: WDispatch) => {
    try {
      const config = await API.getClientConfig();
      setWebServicesURL(config);
      applyRootLocation(config);
      dispatch(actions.fetchConfigSuccess(config));
    } catch (error) {
      console.warn(error);
      dispatch(actions.fetchConfigError());
    }
  }
}

export const fetchSystems = () => {
  return async (dispatch: WDispatch) => {
    try {
      const systemList = await API.getSystemList();
      dispatch(actions.fetchSystemListSuccess(systemList.map(mapSystem)));
    } catch (error) {
      console.warn(error);
      dispatch(actions.fetchSystemListError());
    }
  }
}

export const startSession = (startSessionFn) => {
  return async (dispatch: WDispatch) => {
    try {
      const sessionID = await startSessionFn();
      sessionID
        ? dispatch(actions.startSessionSuccess(sessionID))
        : dispatch(actions.startSessionError());
    } catch (error) {
      console.warn(error);
      dispatch(actions.startSessionError());
    }
  }
}

export const fetchMapData = (formID: FormID, mapID: MapID, loadMapFn) => {
  return async (dispatch: WDispatch) => {
    dispatch(actions.startMapLoad(formID));
    const defaultMapContext = {center: {x: 0, y: 0}, scale: 10000};
    try {
      const loadedMap = await loadMapFn(mapID, defaultMapContext);
      dispatch(actions.loadMapSuccess(formID, loadedMap));
    } catch (error) {
      console.warn(error);
      dispatch(actions.loadMapError(formID))
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
  return async (dispatch: WDispatch) => {
    try {
      dispatch(actions.fetchPresentationsStart());
      const path = `presentationList?sessionId=${sessionID}&formId=${formID}`;
      const data = await sessionManager.fetchData(path);
      setActive(data);
      dispatch(actions.fetchPresentationsEnd(data));
    } catch (error) {
      console.warn(error);
      dispatch(actions.fetchPresentationsEnd(error.message));
    }
  }
}

export const fetchFormPrograms = (formID: FormID, sessionManager, sessionID: SessionID) => {
  return async (dispatch: WDispatch) => {
    try {
      dispatch(actions.fetchProgramsStart(formID));

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
      dispatch(actions.fetchProgramsEndSuccess(formID, data));
    } catch (error) {
      console.warn(error);
      dispatch(actions.fetchProgramsEndError(formID, error.message));
    }
  }
}
