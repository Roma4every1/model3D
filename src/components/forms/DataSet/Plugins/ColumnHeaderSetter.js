import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import ColumnHeaderLabelSetter from "./ColumnHeaderLabelSetter";
import { selectors } from "../../../../store";


export default function ColumnHeaderSetter({formId}) {
  const sessionId = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);

  const [pluginData, setPluginData] = useState(null);

  useEffect(() => {
    let ignore = false;
    if (sessionId) {
      async function fetchData() {
        const path = `pluginData?sessionId=${sessionId}&formId=${formId}&pluginName=tableColumnHeaderSetter`;
        const data = await sessionManager.fetchData(path);
        if (!ignore && data) setPluginData(data);
      }
      fetchData();
    }
    return () => { ignore = true; }
  }, [formId, sessionId, sessionManager]);

  const mapLabels = useCallback((label) => {
    return (
      <ColumnHeaderLabelSetter
        formId={formId} column={label['@columnName']}
        parameter={label['@switchingParameterName']}
        property={label['@ChannelPropertyName']}
      />
    );
  }, [formId])

  return <div>{pluginData?.tableColumnHeaderSetter?.specialLabel?.map(mapLabels)}</div>;
}
