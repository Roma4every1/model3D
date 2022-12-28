import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectors } from "../../../../store";
import DateChangingRule from "./date-changing-rule";


export default function DateChanging() {
  const formID = useSelector(selectors.rootFormID);
  const sessionID = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);
  const [pluginData, setPluginData] = useState(null);

  useEffect(() => {
    let ignore = false;
    if (sessionID) {
      async function fetchData() {
        const path = `pluginData?sessionId=${sessionID}&formId=${formID}&pluginName=dateChanging`;
        const data = await sessionManager.fetchData(path);
        if (!ignore && data) setPluginData(data);
      }
      fetchData();
    }
    return () => { ignore = true; }
  }, [sessionID, formID, sessionManager]);

  return (pluginData?.dateChanging ?
    <DateChangingRule
      yearParameter={pluginData?.dateChanging['@yearParameter']}
      dateIntervalParameter={pluginData?.dateChanging['@dateIntervalParameter']}
      columnNameParameter={pluginData?.dateChanging['@columnNameParameter']}
      formID={formID}
    /> : <div/>
  );
}
