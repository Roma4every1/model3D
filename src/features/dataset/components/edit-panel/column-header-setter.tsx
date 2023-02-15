import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { formParamValueSelector } from 'entities/parameters';
import { stringToTableCell } from 'entities/parameters/lib/table-row';
import { formSettingsSelector } from 'widgets/presentation';
import { formsAPI } from 'widgets/presentation/lib/forms.api';


interface ColumnHeaderSetterProps {
  formID: FormID,
  id: ParameterID,
  column: string,
  property: string,
}


export const ColumnHeaderSetter = ({formID}: PropsFormID) => {
  const [pluginData, setPluginData] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      const { ok, data } = await formsAPI.getPluginData(formID, 'tableColumnHeaderSetter');
      if (!ignore && ok && data) setPluginData(data);
    }
    fetchData();
    return () => { ignore = true; }
  }, [formID]);

  const mapLabels = (label, i: number) => {
    return (
      <ColumnHeaderLabelSetter
        key={i} formID={formID}
        id={label['@switchingParameterName']}
        column={label['@columnName']}
        property={label['@ChannelPropertyName']}
      />
    );
  };

  return <div>{pluginData?.tableColumnHeaderSetter?.specialLabel?.map(mapLabels)}</div>;
};

const ColumnHeaderLabelSetter = ({formID, id, column, property}: ColumnHeaderSetterProps) => {
  const tableSettings: DataSetFormSettings = useSelector(formSettingsSelector.bind(formID));
  const paramValue: string = useSelector(formParamValueSelector.bind({formID, id}));

  const propertyValue = stringToTableCell(paramValue, column);

  const channelProperty = tableSettings?.columns?.columnsSettings.find(cs => {
    return cs.channelPropertyName === property;
  });
  if (channelProperty && (channelProperty.displayName !== propertyValue)) {
    channelProperty.displayName = propertyValue;
  }

  return <div/>;
};
