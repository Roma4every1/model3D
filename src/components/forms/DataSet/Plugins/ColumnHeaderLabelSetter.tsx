import { useSelector } from "react-redux";
import { stringToTableCell } from "../../../../utils/utils";
import { selectors } from "../../../../store";


export default function ColumnHeaderLabelSetter({parameter, property, column, formId}) {
  const tableSettings: any = useSelector(selectors.formSettings.bind(formId));

  const neededParamValues = useSelector((state: WState) => state.sessionManager.paramsManager
    .getParameterValues([parameter], formId, false, ''));
  let propertyValue = stringToTableCell(neededParamValues[0].value, column);

  const channelProperty = tableSettings?.columns?.columnsSettings.find(cs => {
    return cs.channelPropertyName === property;
  });
  if (channelProperty && (channelProperty.displayName !== propertyValue)) {
    channelProperty.displayName = propertyValue;
  }

  return <div/>;
}
