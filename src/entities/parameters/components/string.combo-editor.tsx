import { EditorProps } from './base-editor';
import { ComboBoxChangeEvent, ComboBox } from '@progress/kendo-react-dropdowns';


export const StringComboEditor = ({parameter, update, channel}: EditorProps<ParamTableRow>) => {
  let values = [], valueToShow = undefined;
  let value = parameter.value;

  if (channel && channel.info.properties) {
    const editorColumns = channel.info.lookupColumns;

    const idIndex = editorColumns.id.index;
    const nameIndex = editorColumns.value.index;

    const valuesFromJSON = channel?.data?.rows.map((row) => {
      return {id: row.Cells[idIndex], name: row.Cells[nameIndex]}
    });

    if (valuesFromJSON) values = valuesFromJSON;

    if (value) {
      let stringvalue = String(value);
      let calculatedValueToShow = values.find(o => String(o.id) === stringvalue);
      if (calculatedValueToShow) {
        valueToShow = calculatedValueToShow;
      } else {
        valueToShow = '';
      }
    } else {
      valueToShow = '';
    }
  } else if (value) {
    valueToShow = {id: value, name: value, value: value};
  }

  const onChange = (e: ComboBoxChangeEvent) => update(e.value.name);

  return (
    <ComboBox
      className={'parametereditor'} data={values} value={valueToShow}
      dataItemKey={'id'} textField={'name'} suggest={true}
      onChange={onChange}
    />
  );
};
