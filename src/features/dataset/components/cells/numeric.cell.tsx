import { NumericTextBox } from '@progress/kendo-react-inputs';


export const NumericCell = ({data, dataItem, field, onChange}) => {
  if (typeof data === 'string') data = parseFloat(data.replace(',', '.'));
  if (data === null) data = undefined;

  const handleChange = (e) => {
    if (!onChange) return;
    const value = e.target.value;
    onChange({dataIndex: 0, dataItem, field, syntheticEvent: e.syntheticEvent, value});
  };

  return <NumericTextBox onChange={handleChange} value={data} style={{height: 20}}/>;
};
