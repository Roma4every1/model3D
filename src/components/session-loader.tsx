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
  const [loadSuccess, setLoadSuccess] = useState(undefined);

  useEffect(() => {
    if (loadSuccess) return;
    API.getRootFormState(sessionManager.channelsManager).then((data) => {
      if (typeof data === 'string') { setLoadSuccess(false); return; }
      const rootFormID = data.id;
      dispatch(actions.setRootFormID(rootFormID));
      dispatch(actions.setChildForms(rootFormID, data.children));
      dispatch(actions.setParams(rootFormID, data.parameters));
      dispatch(actions.setPresentations(data.presentations, data.children.openedChildren[0]));
      setLoadSuccess(true);
    });
  }, [loadSuccess, sessionManager, dispatch]);

  if (loadSuccess === undefined) return <LoadingStatus loadingType={'session'}/>;
  if (loadSuccess === false) return <LoadingStatus loadingType={'session'} success={false}/>;
  return <><Dock/><WindowHandler/></>;
}
