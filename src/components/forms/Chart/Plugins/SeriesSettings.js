import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../../../../store";


export default function SeriesSettings({formId: formID}) {
  const dispatch = useDispatch();
  const sessionID = useSelector((state) => state.sessionId);
  const sessionManager = useSelector((state) => state.sessionManager);

  useEffect(() => {
    let ignore = false;
    if (sessionID) {
      async function fetchData() {
        const data = await sessionManager.fetchData(`pluginData?sessionId=${sessionID}&formId=${formID}&pluginName=chartSeriesSettings`);
        if (!ignore && data) dispatch(actions.setSeriesSettings(formID, data.chartSeriesSettings))
      }
      fetchData().then();
    }
    return () => { ignore = true; }
  }, [sessionID, formID, sessionManager, dispatch]);

  return <div/>;
}
