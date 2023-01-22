import { EditorProps } from "./base-editor";
import { useSelector } from "react-redux";
import { NumericTextBoxChangeEvent, NumericTextBox } from "@progress/kendo-react-inputs";


/** Редактор целого числа.
 *
 * [Стили форматирования](https://github.com/telerik/kendo-intl/blob/master/docs/num-formatting/index.md)
 * */
export const IntegerEditor = ({valueSelector, update}: EditorProps<ParamValueInteger>) => {
  let value = useSelector(valueSelector);
  if (value === null) value = undefined;

  const onChange = (e: NumericTextBoxChangeEvent) => update(e.value);
  return <NumericTextBox value={value} format={'#'} onChange={onChange}/>;
};
