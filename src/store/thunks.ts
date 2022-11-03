import { WDispatch } from "./index";
import { API } from "../api/api";
import { mapSystem } from "../utils/utils";
import { applyConfig } from "../api/initialization";
import { actions } from "./index";


export const fetchConfig = () => {
  return async (dispatch: WDispatch) => {
    dispatch(actions.fetchConfigStart());
    const res = await API.getClientConfig();
    const config = applyConfig(res);
    API.setBase(config.data.webServicesURL);
    API.setRoot(config.data.root);
    dispatch(actions.fetchConfigEnd(config));
  }
}

export const fetchSystems = () => {
  return async (dispatch: WDispatch) => {
    dispatch(actions.fetchSystemListStart());
    const response = await API.getSystemList();
    if (response.ok) response.data = response.data.map(mapSystem);
    dispatch(actions.fetchSystemListEnd(response));
  }
}

export const startSession = (startSessionFn, isDefault: boolean) => {
  return async (dispatch: WDispatch) => {
    dispatch(actions.fetchSessionStart());
    const res: Res<SessionID> = await startSessionFn(isDefault);
    dispatch(actions.fetchSessionEnd(res));
  }
}

export const fetchMapData = (provider: any, sessionID: SessionID, formID: FormID, mapID: MapID, owner: MapOwner) => {
  return async (dispatch: WDispatch) => {
    dispatch(actions.startMapLoad(formID));
    const loadedMap = await API.maps.loadMap(provider, sessionID, formID, mapID, owner);
    if (typeof loadedMap === 'string') {
      console.warn(loadedMap);
      dispatch(actions.loadMapError(formID));
    } else {
      if (loadedMap.mapErrors.length) loadedMap.mapErrors.forEach(err => console.warn(err));
      dispatch(actions.loadMapSuccess(formID, loadedMap));
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
