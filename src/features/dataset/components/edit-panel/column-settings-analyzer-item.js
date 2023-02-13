import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { formSettingsSelector, setFormSettings } from '../../../../widgets/form';
import { formParamValueSelector } from '../../../../entities/parameters';
import { stringToTableCell } from '../../../../entities/parameters/lib/table-row';


export default function ColumnSettingsAnalyzerItem(props) {
  const dispatch = useDispatch();
  const { item, parameterName, path, propertyName, type, formId, start, finish } = props;

  const tableSettings = useSelector(formSettingsSelector.bind(formId));
  const valueSelector = formParamValueSelector.bind({formID: formId, id: parameterName});
  let propertyValue = useSelector(valueSelector);

  if (type === 'CellValue' && propertyValue) {
    propertyValue = stringToTableCell(propertyValue, propertyName);
  }

  const addedProperty = propertyValue ? start + propertyValue + finish : null;
  let changed = false;

  if (path === 'ColumnGroupSettings') {
    let channelProperty = tableSettings?.columns?.ColumnGroupSettings.find(cs => cs.columnGroupName === item);
    if (channelProperty && (channelProperty.calculatedDisplayName !== addedProperty)) {
      changed = true;
      channelProperty.calculatedDisplayName = addedProperty;
    }
  } else if (path === 'ColumnsSettings') {
    let channelProperty = tableSettings?.columns?.columnsSettings.find(cs => cs.channelPropertyName === item);
    if (channelProperty && (channelProperty.calculatedDisplayName !== addedProperty)) {
      changed = true;
      channelProperty.calculatedDisplayName = addedProperty;
    }
  }
  if (changed) dispatch(setFormSettings(formId, {...tableSettings}));

  return <div />;
}
