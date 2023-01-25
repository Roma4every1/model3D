import { Input } from "@progress/kendo-react-inputs";


export const TextCell = ({data, dataItem, field, onChange}) => {
  const handleChange = (e) => {
    if (!onChange) return;
    const value = e.target.value;
    onChange({dataIndex: 0, dataItem, field, syntheticEvent: e.syntheticEvent, value});
  };

  return <Input onChange={handleChange} value={data} style={{height: 20}}/>;
};
