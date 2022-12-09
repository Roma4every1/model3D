import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectors } from "../../../../store";
import ColumnHeaderLabelSetter from "./column-header-label-setter";


export function ColumnHeaderSetter({formID}: PropsFormID) {
  const sessionId = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);

  const [pluginData, setPluginData] = useState(null);

  useEffect(() => {
    let ignore = false;
    if (sessionId) {
      async function fetchData() {
        const path = `pluginData?sessionId=${sessionId}&formId=${formID}&pluginName=tableColumnHeaderSetter`;
        const data = await sessionManager.fetchData(path);
        if (!ignore && data) setPluginData(data);
      }
      fetchData();
    }
    return () => { ignore = true; }
  }, [formID, sessionId, sessionManager]);

  const mapLabels = useCallback((label) => {
    return (
      <ColumnHeaderLabelSetter
        formId={formID} column={label['@columnName']}
        parameter={label['@switchingParameterName']}
        property={label['@ChannelPropertyName']}
      />
    );
  }, [formID])

  return <div>{pluginData?.tableColumnHeaderSetter?.specialLabel?.map(mapLabels)}</div>;
}
