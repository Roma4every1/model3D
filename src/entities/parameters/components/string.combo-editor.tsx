import { EditorProps } from './editor-dict.ts';
import { ComboBoxChangeEvent, ComboBox } from '@progress/kendo-react-dropdowns';
import { getComboBoxItems } from '../lib/utils';


export const StringComboEditor = ({parameter, update, channel}: EditorProps<ParamTableRow>) => {
  const value = parameter.value;
  let values = [], valueToShow = undefined;

  if (channel) {
    const valuesFromJSON = getComboBoxItems(channel);
    if (valuesFromJSON) values = valuesFromJSON;

    if (value) {
      const valueString = String(value);
      valueToShow = values.find(o => String(o.id) === valueString) ?? '';
    } else {
      valueToShow = '';
    }
  } else if (value) {
    valueToShow = {id: value, name: value, value: value};
  }

  const onChange = (e: ComboBoxChangeEvent) => {
    const newValue = e.value?.name ?? null;
    if (newValue !== value) update(newValue);
  };

  return (
    <ComboBox
      dataItemKey={'id'} textField={'name'} suggest={true}
      data={values} value={valueToShow} onChange={onChange}
    />
  );
};
