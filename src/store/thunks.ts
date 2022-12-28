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

export const fetchMapData = (
  formID: FormID, mapID: MapID,
  owner: MapOwner, x: string = undefined,
) => {
  return async (dispatch: WDispatch) => {
    dispatch(actions.startMapLoad(formID));
    const loadedMap = await API.maps.loadMap(x || formID, mapID, owner);
    if (typeof loadedMap === 'string') {
      console.warn(loadedMap);
      dispatch(actions.loadMapError(formID));
    } else {
      if (loadedMap.mapErrors.length) loadedMap.mapErrors.forEach(err => console.warn(err));
      dispatch(actions.loadMapSuccess(formID, loadedMap));
    }
  }
}

export const fetchFormPrograms = (formID: FormID, sessionManager: SessionManager, sessionID: SessionID) => {
  return async (dispatch: WDispatch) => {
    try {
      dispatch(actions.fetchProgramsStart(formID));

      const path = `programsList?sessionId=${sessionID}&formId=${formID}`;
      const data: ProgramListData = await sessionManager.fetchData(path);

      for (const program of data) {
        if (program.needCheckVisibility === false) {
          program.visible = true; continue;
        }

        const params = program.paramsForCheckVisibility;
        try {
          const paramValues = sessionManager.paramsManager
            .getParameterValues(params, formID, false, undefined);

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
