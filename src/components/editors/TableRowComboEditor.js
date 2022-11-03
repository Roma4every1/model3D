import React, { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { ComboBox } from "@progress/kendo-react-dropdowns";
import { stringToTableCell, tableRowToString } from "../../utils/utils";
import i18n from "i18next";


/*
props {
  displayName: string,
  editorType: string,
  externalChannelName: string,
  formID: string,
  formIdToLoad: any,
  id: string,
  selectionChanged: function,
  value: any,
}
*/

/*
KendoReact ComboBox props {
  name: string, // задает свойство имени входного элемента DOM
  data: any[], // список возможных вариантов
  value: any, // значение ComboBox; может быть примитивным или сложным (напр. объект)
  suggest: boolean, // автозаполнение текста на основе первого элемента данных
  allowCustom: boolean, // возможность установить значение не из предлагаемых
  placeholder: string, // подсказка, которая отображается, когда ComboBox пуст
  onOpen: function, // срабатывает, когда всплывающее окно ComboBox вот-вот откроется.
  onChange: function, // срабатывает каждый раз, когда значение ComboBox собирается измениться
}
*/

const getValueToShow = (valuesToSelect, formParameter) => {
  let values = [], valueToShow;
  const value = formParameter.value;
  const nullDisplayValue = formParameter.nullDisplayValue ?? i18n.t('editors.activeObjectNullDisplayName');
  const showNullValue = formParameter.showNullValue;

  if (valuesToSelect && valuesToSelect.properties) {
    // сюда попадем если данные канала уже загружены
    const valuesFromJSON = valuesToSelect?.data?.Rows?.map((row) => tableRowToString(valuesToSelect, row));

    values = (valuesFromJSON) ? valuesFromJSON : [];

    if (showNullValue) {
      values.push({id: null, name: nullDisplayValue, value: null})
    }

    if (value) {
      const dataID = stringToTableCell(value, 'LOOKUPCODE');
      const calculatedValueToShow = values.find(o => String(o.id) === dataID);
      valueToShow = calculatedValueToShow ? calculatedValueToShow : '';
    } else if (showNullValue) {
      valueToShow = {id: value, name: nullDisplayValue, value: value};
    }
  } else if (value) {
    // сюда попадем если данные канала ещё не загружены
    let lookupCode = stringToTableCell(value, 'LOOKUPCODE')
    let lookupValue = stringToTableCell(value, 'LOOKUPVALUE');
    if (lookupValue === value) lookupValue = lookupCode;
    valueToShow = {id: lookupCode, name: lookupValue, value: value};
  } else if (showNullValue) {
    valueToShow = {id: value, name: nullDisplayValue, value: value};
  }
  return [valueToShow, values, nullDisplayValue];
}

export default function TableRowComboEditor({id, formId: formID, selectionChanged, externalChannelName}) {
  const sessionManager = useSelector((state) => state.sessionManager);
  const formParameter = useSelector((state) => state.formParams[formID].find((gp) => gp.id === id));
  const valuesToSelect = useSelector((state) => state.channelsData[externalChannelName]);

  const [valueToShow, values, nullDisplayValue] = getValueToShow(valuesToSelect, formParameter);
  const [readyValueToShow, setReadyValueToShow] = useState(valueToShow);

  const setNewValue = useCallback((value, manual) => {
    selectionChanged({target: {name: id, manual, value}});
  }, [id, selectionChanged]);

  // event: ComboBoxChangeEvent
  const onChange = (event) => {
    setReadyValueToShow(event.target.value);
    setNewValue(event.target.value?.value, true);
  }

  const onOpen = () => {
    sessionManager.channelsManager.loadAllChannelData(externalChannelName, formID, false).then();
  };

  return (
    <ComboBox
      className={'parametereditor'} dataItemKey={'id'} textField={'name'}
      name={id} data={values}
      value={readyValueToShow} placeholder={nullDisplayValue}
      suggest={true} allowCustom={true}
      onChange={onChange} onOpen={onOpen}
    />
  );
}
