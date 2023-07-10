import { EditorProps } from './base-editor';
import { ComboBoxChangeEvent, ComboBox } from '@progress/kendo-react-dropdowns';
import { stringToTableCell, tableRowToString } from '../lib/table-row';


const getValueToShow = (channel: Channel, formParameter: ParamTableRow) => {
  let data = [], initValue = null;
  const value = formParameter.value;
  const nullDisplayValue = formParameter.nullDisplayValue ?? 'Нет значения';
  const showNullValue = formParameter.showNullValue;

  if (channel && channel.info.properties) {
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
};

export const TableRowComboEditor = ({parameter, update, channel}: EditorProps<ParamTableRow>) => {
  const [value, data, nullDisplayValue] = getValueToShow(channel, parameter);

  const onChange = (event: ComboBoxChangeEvent) => {
    let newValue = event.value?.value ?? null;
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

function getComboBoxItems(channel: Channel) {
  const rows = channel.data?.rows;
  if (!rows) return null;

  const lookupColumns = channel.info.lookupColumns;
  const idIndex = lookupColumns.id.index;
  let valueIndex = lookupColumns.value.index;

  if (valueIndex === -1) valueIndex = idIndex;
  return rows.map((row) => getComboBoxItem(row, idIndex, valueIndex));
}

function getComboBoxItem(row: ChannelRow, idIndex: number, valueIndex: number) {
  const id = row.Cells[idIndex];
  return {id, name: row.Cells[valueIndex] ?? id, value: row};
}
