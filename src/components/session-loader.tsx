import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectors, actions } from "../store";

import Form from './forms/form/form';
import LoadingStatus from "./common/loading-status";
import WindowHandler from "./common/window-handler";


export default function SessionLoader() {
  const dispatch = useDispatch();
  const sessionID = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);

  const [formData, setFormData] = useState<any>();

  useEffect(() => {
    let ignore = false;

    async function getFormData() {
      if (sessionID && !ignore) {
        const data = await sessionManager.fetchData(`getRootForm?sessionId=${sessionID}`);
        dispatch(actions.setRootFormID(data.id));
        setFormData(data);
      }
    }
    getFormData();

    return () => { ignore = true; }
  }, [sessionID, sessionManager, dispatch]);

  return (
    <>
      {(!formData || sessionManager.getSessionLoading())
        ? <LoadingStatus loadingType={'session'}/>
        : <Form key={'root'} formData={formData} data={undefined}/>}
      <WindowHandler />
    </>
  );
}
