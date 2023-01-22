import { useSelector } from "react-redux";
import { stringToTableCell } from "../../../../utils/utils";
import { selectors } from "../../../../store";


export default function ColumnHeaderLabelSetter({parameter, property, column, formId}) {
  const tableSettings: DataSetFormSettings = useSelector(selectors.formSettings.bind(formId));
  const valueSelector = selectors.formParamValue.bind({formID: formId, id: parameter});
  const paramValue: any = useSelector(valueSelector);
  const propertyValue = stringToTableCell(paramValue, column);

  const channelProperty = tableSettings?.columns?.columnsSettings.find(cs => {
    return cs.channelPropertyName === property;
  });
  if (channelProperty && (channelProperty.displayName !== propertyValue)) {
    channelProperty.displayName = propertyValue;
  }

  return <div/>;
}
