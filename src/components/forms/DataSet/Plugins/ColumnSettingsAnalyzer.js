import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ColumnSettingsAnalyzerItem from "./ColumnSettingsAnalyzerItem";
import { selectors } from "../../../../store";


export default function ColumnSettingsAnalyzer({formId}) {
  const sessionId = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);

  const [pluginData, setPluginData] = useState(null);

  useEffect(() => {
    let ignore = false;
    if (sessionId) {
      const addSubstitution = (substitutes, value, path, item) => {
        if (value?.includes('$(')) {
          let startIndex = value.indexOf('$(');
          let finishIndex = value.indexOf(')', startIndex);
          let start = value.slice(0, startIndex);
          let finish = value.slice(finishIndex + 1);
          let pathToChange = value.slice(startIndex + 2, finishIndex);
          let pointIndex = pathToChange.indexOf('.');
          let bracketIndex = pathToChange.indexOf('[');
          let parameterName = pathToChange.slice(0, pointIndex);
          let type = pathToChange.slice(pointIndex + 1, bracketIndex);
          let propertyName = pathToChange.slice(bracketIndex + 1, -1);

          if (bracketIndex < 0) {
            type = pathToChange.slice(pointIndex + 1);
            propertyName = null;
          }
          substitutes.push({type, parameterName, propertyName, path, item, formId, start, finish});
        }
      };

      async function fetchData() {
        const data = await sessionManager.fetchData(`pluginData?sessionId=${sessionId}&formId=${formId}&pluginName=tableColumnsSettings`);
        if (!ignore && data) {
          let substitutes = [];
          if (data?.tableColumnsSettings?.ColumnGroupSettings?.ColumnGroupSettings) {
            data.tableColumnsSettings.ColumnGroupSettings.ColumnGroupSettings.forEach(gs => (
            addSubstitution(substitutes, gs['@ColumnGroupDisplayName'], 'ColumnGroupSettings', gs['@ColumnGroupName'])
            ));
          }
          if (data?.tableColumnsSettings?.ColumnsSettings?.ColumnsSettings) {
            data.tableColumnsSettings.ColumnsSettings.ColumnsSettings.forEach(gs => (
            addSubstitution(substitutes, gs['@DisplayName'], 'ColumnsSettings', gs['@ChannelPropertyName'])
            ));
          }
          setPluginData(substitutes);
        }
      }
      fetchData();
    }
    return () => { ignore = true; }
  }, [formId, sessionId, sessionManager]);

  return (
    <div>
      {pluginData?.map(substitute => <ColumnSettingsAnalyzerItem {...substitute} />)}
    </div>
  );
}
