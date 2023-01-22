import { EditorProps } from "./base-editor";
import { useSelector } from "react-redux";
import { CheckboxChangeEvent, Checkbox } from "@progress/kendo-react-inputs";


export const BoolEditor = ({valueSelector, update}: EditorProps<ParamValueBool>) => {
  let value = useSelector(valueSelector);
  if (value === null) value = false;

  const onChange = (e: CheckboxChangeEvent) => update(e.value);
  return <Checkbox value={value} onChange={onChange}/>;
};
