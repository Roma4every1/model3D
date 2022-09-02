import React from "react";
import { useSelector } from "react-redux";
import { NumericTextBox } from "@progress/kendo-react-inputs";


/** Целочисленный текстовый редактор.
 *
 * [Стили форматирования](https://github.com/telerik/kendo-intl/blob/master/docs/num-formatting/index.md)
 * */
export default function IntegerTextEditor(props) {
  const {selectionChanged, value: propsValue, id, formId} = props;
  let value = useSelector((state) => {
      return formId
        ? state.formParams[formId].find((gp) => gp.id === id).value
        : propsValue
  });

  if (typeof value === 'string') {
    value = parseFloat(value.replaceAll(',', '.'));
  }

  return (
    <NumericTextBox
      className={'parametereditor'} name={id}
      value={value} format={'#'}
      onChange={selectionChanged}
    />
  );
}
