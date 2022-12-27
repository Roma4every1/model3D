import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions, selectors } from "../store";
import { API } from "../api/api";

import { Dock } from "./forms/dock/dock";
import { LoadingStatus } from "./common/loading-status";
import { WindowHandler } from "./common/window-handler";


export const SessionLoader = () => {
  const dispatch = useDispatch();
  const sessionManager = useSelector(selectors.sessionManager);
  const [formID, setFormID] = useState(null);

  useEffect(() => {
    if (formID) return;
    API.getRootFormState(sessionManager.channelsManager).then((data) => {
      if (typeof data === 'string') return;
      const rootFormID = data.id;
      dispatch(actions.setRootFormID(rootFormID));
      dispatch(actions.setChildForms(rootFormID, data.children));
      dispatch(actions.setParams(rootFormID, data.parameters));
      setFormID(rootFormID);
    });
  }, [formID, sessionManager, dispatch]);

  return (
    <>
      {formID ? <Dock formID={formID}/> : <LoadingStatus loadingType={'session'}/>}
      <WindowHandler />
    </>
  );
}
