import { EditorProps } from './base-editor';
import { ComboBoxChangeEvent, ComboBox } from '@progress/kendo-react-dropdowns';
import { getComboBoxItems } from '../lib/utils';
import { stringToTableCell, tableRowToString } from '../lib/table-row';


export const TableRowComboEditor = ({parameter, update, channel}: EditorProps<ParamTableRow>) => {
  const [value, data, nullDisplayValue] = getValueToShow(channel, parameter);

  const onChange = (e: ComboBoxChangeEvent) => {
    if (e.syntheticEvent.type === 'blur') return;
    let newValue = e.value?.value ?? null;
    if (newValue !== null && typeof newValue !== 'string')
      newValue = tableRowToString(channel, newValue);
    update(newValue);
  };

  return (
    <ComboBox
      data={data} dataItemKey={'id'} textField={'name'}
      value={value} placeholder={nullDisplayValue} clearButton={parameter.canBeNull}
      suggest={true} onChange={onChange}
    />
  );
};

function getValueToShow(channel: Channel, formParameter: ParamTableRow) {
  let data = [], initValue = null;
  const value = formParameter.value;
  const nullDisplayValue = formParameter.nullDisplayValue ?? 'Нет значения';
  const showNullValue = formParameter.showNullValue;

  if (channel) {
    const valuesFromChannel = getComboBoxItems(channel);
    if (valuesFromChannel) data = valuesFromChannel;

    if (showNullValue) {
      data.push({id: null, name: nullDisplayValue, value: null});
    }

    if (value) {
      const dataID = stringToTableCell(value, 'LOOKUPCODE');
      initValue = data.find(item => String(item.id) === dataID) ?? null;
    } else if (showNullValue) {
      initValue = {id: value, name: nullDisplayValue, value};
    }
  } else if (value) {
    let lookupCode = stringToTableCell(value, 'LOOKUPCODE')
    let lookupValue = stringToTableCell(value, 'LOOKUPVALUE');
    if (lookupValue === value) lookupValue = lookupCode;
    initValue = {id: lookupCode, name: lookupValue, value};
  } else if (showNullValue) {
    initValue = {id: value, name: nullDisplayValue, value};
  }
  return [initValue, data, nullDisplayValue];
}
