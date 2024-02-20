import { EditorProps } from './editor-dict.ts';
import { getComboBoxItems } from '../lib/utils';
import { tableCellToString } from '../lib/table-row';
import { ComboBox, ComboBoxChangeEvent } from '@progress/kendo-react-dropdowns';


export const TableCellComboEditor = ({parameter, update, channel}: EditorProps<ParamTableCell>) => {
  const [value, data, nullDisplayValue] = getValueToShow(channel, parameter);

  const onChange = (e: ComboBoxChangeEvent) => {
    if (e.syntheticEvent.type === 'blur') return;
    let newValue = e.value?.value ?? null;

    if (newValue !== null && typeof newValue !== 'string') {
      newValue = tableCellToString(channel, newValue);
    }
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

function getValueToShow(channel: Channel, parameter: ParamTableCell) {
  let data = [], initValue = null;
  const value = parameter.value;
  const nullDisplayValue = parameter.nullDisplayValue ?? 'Нет значения';

  if (channel) {
    const comboBoxItems = getComboBoxItems(channel);
    if (comboBoxItems) data = comboBoxItems;
    if (parameter.showNullValue) data.push({id: null, name: nullDisplayValue, value: null});

    if (value) {
      const dataID = value.substring(0, value.indexOf('#'));
      initValue = data.find(item => String(item.id) === dataID) ?? null;
    } else if (parameter.showNullValue) {
      initValue = {id: value, name: nullDisplayValue, value};
    }
  } else if (parameter.showNullValue) {
    initValue = {id: value, name: nullDisplayValue, value};
  }
  return [initValue, data, nullDisplayValue];
}
