import React, { useState, useEffect } from 'react';
import ColumnSettingsAnalyzerItem from './column-settings-analyzer-item';
import { formsAPI } from '../../../../widgets/presentation/lib/forms.api';


export const ColumnSettingsAnalyzer = ({formID}) => {
  const [pluginData, setPluginData] = useState(null);

  useEffect(() => {
    let ignore = false;
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
        substitutes.push({type, parameterName, propertyName, path, item, formID, start, finish});
      }
    };

    async function fetchData() {
      const { ok, data } = await formsAPI.getPluginData(formID, 'tableColumnsSettings')
      if (!ignore && ok && data) {
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
    return () => { ignore = true; }
  }, [formID]);

  return (
    <div>
      {pluginData?.map(substitute => <ColumnSettingsAnalyzerItem {...substitute} />)}
    </div>
  );
};
