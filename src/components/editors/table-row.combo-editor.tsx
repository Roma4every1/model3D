import { EditorProps } from "./base-editor";
import { useState } from "react";
import { useSelector } from "react-redux";
import { ComboBoxChangeEvent, ComboBox } from "@progress/kendo-react-dropdowns";
import { stringToTableCell, tableRowToString } from "../../utils/utils";
import { selectors, sessionManager } from "../../store";


const getValueToShow = (channel: Channel, formParameter: ParamTableRow) => {
  let data = [], initValue;
  const value = formParameter.value;
  const nullDisplayValue = formParameter.nullDisplayValue ?? 'Нет значения';
  const showNullValue = formParameter.showNullValue;

  if (channel && channel.properties) {
    // сюда попадем если данные канала уже загружены
    const valuesFromChannel = channel?.data?.Rows?.map(row => tableRowToString(channel, row));
    if (valuesFromChannel) data = valuesFromChannel;

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

export const TableRowComboEditor = ({id, formID, update, channelName}: EditorProps) => {
  const formParameter: ParamTableRow = useSelector(selectors.formParam.bind({formID, id}));
  const channel: Channel = useSelector(selectors.channel.bind(channelName));

  const [value, data, nullDisplayValue] = getValueToShow(channel, formParameter);
  const [x, setX] = useState(false); // for rerender

  const onChange = (event: ComboBoxChangeEvent) => {
    update(event.value?.value ?? null); setX(!x);
  };
  const onOpen = () => {
    sessionManager.channelsManager.loadAllChannelData(channelName, formID, false);
  };

  return (
    <ComboBox
      data={data} dataItemKey={'id'} textField={'name'}
      value={value} placeholder={nullDisplayValue}
      suggest={true} onChange={onChange} onOpen={onOpen}
    />
  );
};
