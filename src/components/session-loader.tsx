import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { actions, sessionManager } from "../store";
import { API } from "../api/api";

import { Dock } from "./forms/dock/dock";
import { LoadingStatus } from "./common/loading-status";
import { WindowHandler } from "./common/window-handler";


export const SessionLoader = () => {
  const dispatch = useDispatch();
  const [loadSuccess, setLoadSuccess] = useState(undefined);

  useEffect(() => {
    if (loadSuccess) return;
    API.getRootFormState(sessionManager.channelsManager).then((data) => {
      if (typeof data === 'string') { setLoadSuccess(false); return; }
      const rootFormID = data.id;
      dispatch(actions.setRootFormID(rootFormID));
      dispatch(actions.setFormSettings(rootFormID, data.settings));
      dispatch(actions.setChildForms(rootFormID, data.children));
      dispatch(actions.setParams(rootFormID, data.parameters));
      dispatch(actions.setPresentations(data.presentations, data.children.openedChildren[0]));
      setLoadSuccess(true);
    });
  }, [loadSuccess, dispatch]);

  if (loadSuccess === undefined) return <LoadingStatus loadingType={'session'}/>;
  if (loadSuccess === false) return <LoadingStatus loadingType={'session'} success={false}/>;
  return <><Dock/><WindowHandler/></>;
};
