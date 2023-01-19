import { useState } from "react";
import { useSelector } from "react-redux";
import { ComboBoxChangeEvent, ComboBox } from "@progress/kendo-react-dropdowns";
import { stringToTableCell, tableRowToString } from "../../utils/utils";
import { selectors } from "../../store";


const getValueToShow = (channel: Channel, formParameter: FormParameter) => {
  let data = [], initValue;
  const value = formParameter.value;
  const nullDisplayValue = formParameter.nullDisplayValue ?? 'Нет значения';
  const showNullValue = formParameter.showNullValue;

  if (channel && channel.properties) {
    // сюда попадем если данные канала уже загружены
    const valuesFromJSON = channel?.data?.Rows?.map(row => tableRowToString(channel, row));
    if (valuesFromJSON) data = valuesFromJSON;

    if (showNullValue) {
      data.push({id: null, name: nullDisplayValue, value: null})
    }

    if (value) {
      const dataID = stringToTableCell(value, 'LOOKUPCODE');
      const calculatedValueToShow = data.find(o => String(o.id) === dataID);
      initValue = calculatedValueToShow ? calculatedValueToShow : '';
    } else if (showNullValue) {
      initValue = {id: value, name: nullDisplayValue, value};
    }
  } else if (value) {
    // сюда попадем если данные канала ещё не загружены
    let lookupCode = stringToTableCell(value, 'LOOKUPCODE')
    let lookupValue = stringToTableCell(value, 'LOOKUPVALUE');
    if (lookupValue === value) lookupValue = lookupCode;
    initValue = {id: lookupCode, name: lookupValue, value};
  } else if (showNullValue) {
    initValue = {id: value, name: nullDisplayValue, value};
  }
  return [initValue, data, nullDisplayValue];
};

export default function TableRowComboEditor({id, formId: formID, externalChannelName}) {
  const sessionManager = useSelector(selectors.sessionManager);
  const formParameter: FormParameter = useSelector(selectors.formParam.bind({formID, id}));
  const channel: Channel = useSelector(selectors.channel.bind(externalChannelName));

  const [initValue, data, nullDisplayValue] = getValueToShow(channel, formParameter);
  const [value, setValue] = useState(initValue);

  const onChange = (event: ComboBoxChangeEvent) => {
    const listItem = event.target.value;
    setValue(listItem);
    sessionManager.paramsManager.updateParamValue(formID, id, listItem?.value, true);
  };
  const onOpen = () => {
    sessionManager.channelsManager.loadAllChannelData(externalChannelName, formID, false);
  };

  return (
    <ComboBox
      className={'parametereditor'} dataItemKey={'id'} textField={'name'}
      name={id} data={data}
      value={value} placeholder={nullDisplayValue}
      suggest={true} allowCustom={true}
      onChange={onChange} onOpen={onOpen}
    />
  );
}
