import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import Form from './forms/Form';
import LoadingStatus from "./common/LoadingStatus";
import WindowHandler from "./common/WindowHandler";


export default function SessionLoader() {
  const sessionID = useSelector((state) => state.sessionId);
  const sessionManager = useSelector((state) => state.sessionManager);

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
        : <Form key="root" formData={formData}/>
      }
    </>
  );
}
