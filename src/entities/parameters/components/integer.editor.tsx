import { EditorProps } from './editor-dict.ts';
import { NumericTextBoxChangeEvent, NumericTextBox } from '@progress/kendo-react-inputs';


/** Редактор целого числа.
 *
 * [Стили форматирования](https://github.com/telerik/kendo-intl/blob/master/docs/num-formatting/index.md)
 * */
export const IntegerEditor = ({parameter, update}: EditorProps<ParamInteger>) => {
  let value = parameter.value
  if (value === null) value = undefined;

  const onChange = (e: NumericTextBoxChangeEvent) => update(e.value);
  return <NumericTextBox value={value} format={'#'} onChange={onChange}/>;
};
