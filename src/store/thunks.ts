import { WDispatch } from "./index";
import { API } from "../api/api";
import { mapSystem } from "../utils/utils";
import { createClientConfig } from "../api/initialization";
import { actions, sessionManager } from "./index";


export async function initialize(dispatch: WDispatch) {
  const resConfig = await API.getClientConfig();
  const config = createClientConfig(resConfig);

  API.setBase(config.webServicesURL);
  API.setRoot(config.root);

  const resSystemList = await API.getSystemList();
  const systemList: SystemList = resSystemList.ok ? resSystemList.data.map(mapSystem) : null;
  dispatch(actions.setInitResult(config, systemList));
}

export async function startSession(this: boolean, dispatch: WDispatch) {
  dispatch(actions.fetchSessionStart());
  const res: Res<SessionID> = await sessionManager.startSession(this);
  dispatch(actions.fetchSessionEnd(res));
}

export const fetchMapData = (formID: FormID, mapID: MapID, owner: MapOwner, setProgress: Function) => {
  return async (dispatch: WDispatch) => {
    dispatch(actions.startMapLoad(formID));
    const loadedMap = await API.maps.loadMap(mapID, owner, setProgress);
    if (typeof loadedMap === 'string') {
      console.warn(loadedMap);
      dispatch(actions.loadMapError(formID));
    } else {
      if (loadedMap.mapErrors.length) loadedMap.mapErrors.forEach(err => console.warn(err));
      dispatch(actions.loadMapSuccess(formID, loadedMap));
    }
  }
};

export async function fetchFormPrograms(this: FormID, dispatch: WDispatch) {
  try {
    dispatch(actions.fetchProgramsStart(this));
    const res = await API.programs.getProgramsList(this);
    if (res.ok === false) { dispatch(actions.fetchProgramsEndError(this, res.data)); return; }

    for (const program of res.data) {
      if (program.needCheckVisibility === false) { program.visible = true; continue; }
      const params = program.paramsForCheckVisibility;

      try {
        const paramValues = sessionManager.paramsManager
          .getParameterValues(params, this, false);

        const body = {sessionId: API.requester.sessionID, reportId: program.id, paramValues};
        const { data: visible } = await API.programs.getProgramVisibility(JSON.stringify(body));
        program.visible = visible === 'true';
      } catch {
        program.visible = false;
      }
    }
    dispatch(actions.fetchProgramsEndSuccess(this, res.data));
  } catch (error) {
    console.warn(error);
    dispatch(actions.fetchProgramsEndError(this, error.message));
  }
}
