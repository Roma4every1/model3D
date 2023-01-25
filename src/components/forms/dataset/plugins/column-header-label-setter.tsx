import { useSelector } from "react-redux";
import { stringToTableCell } from "../../../../utils/utils";
import { selectors } from "../../../../store";


interface ColumnHeaderSetterProps {
  formID: FormID,
  id: ParameterID,
  column: string,
  property: string,
}


export const ColumnHeaderLabelSetter = ({formID, id, column, property}: ColumnHeaderSetterProps) => {
  const tableSettings: DataSetFormSettings = useSelector(selectors.formSettings.bind(formID));
  const paramValue: string = useSelector(selectors.formParamValue.bind({formID, id}));

  const propertyValue = stringToTableCell(paramValue, column);

  const channelProperty = tableSettings?.columns?.columnsSettings.find(cs => {
    return cs.channelPropertyName === property;
  });
  if (channelProperty && (channelProperty.displayName !== propertyValue)) {
    channelProperty.displayName = propertyValue;
  }

  return <div/>;
}
