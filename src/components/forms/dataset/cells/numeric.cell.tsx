import { NumericTextBox } from '@progress/kendo-react-inputs';


export const NumericCell = ({data, dataItem, field, onChange}) => {
  const handleChange = (e) => {
    if (!onChange) return;
    const value = e.target.value;
    onChange({dataIndex: 0, dataItem, field, syntheticEvent: e.syntheticEvent, value});
  };

  const value = typeof data === 'string' ? parseFloat(data.replaceAll(',', '.')) : data;
  return <NumericTextBox onChange={handleChange} value={value} style={{height: 20}}/>;
};
