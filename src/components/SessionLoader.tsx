import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectors } from "../store";

import Form from './forms/Form';
import LoadingStatus from "./common/LoadingStatus";
import WindowHandler from "./common/WindowHandler";


export default function SessionLoader() {
  const sessionID = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);

  const [formData, setFormData] = useState();

  useEffect(() => {
    let ignore = false;

    async function getFormData() {
      if (sessionID && !ignore) {
        const data = await sessionManager.fetchData(`getRootForm?sessionId=${sessionID}`);
        setFormData(data);
      }
    }
    getFormData();

    return () => { ignore = true; }
  }, [sessionID, sessionManager]);

  return (
    <>
      <WindowHandler />
      {(!formData || sessionManager.getSessionLoading())
        ? <LoadingStatus loadingType={'session'}/>
        : <Form key={'root'} formData={formData} data={undefined}/>
      }
    </>
  );
}
