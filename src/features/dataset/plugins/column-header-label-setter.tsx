import { useSelector } from 'react-redux';
import { formSettingsSelector } from 'widgets/form';
import { formParamValueSelector } from 'entities/parameters';
import { stringToTableCell } from 'entities/parameters/lib/table-row';


interface ColumnHeaderSetterProps {
  formID: FormID,
  id: ParameterID,
  column: string,
  property: string,
}


export const ColumnHeaderLabelSetter = ({formID, id, column, property}: ColumnHeaderSetterProps) => {
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
}
