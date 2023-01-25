import { CheckboxChangeEvent, Checkbox } from "@progress/kendo-react-inputs";


export const BooleanCell = ({data, dataItem, field, onChange}) => {
  const handleChange = (e: CheckboxChangeEvent) => {
    if (!onChange) return;
    const value = e.value ? 'true' : 'false';
    onChange({dataIndex: 0, dataItem, field, syntheticEvent: e.syntheticEvent, value});
  };

  return <Checkbox onChange={handleChange} value={data === 'true'} style={{height: 20}}/>;
};
