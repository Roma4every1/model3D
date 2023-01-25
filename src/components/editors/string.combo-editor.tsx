import { EditorProps } from './base-editor';
import { useSelector } from 'react-redux';
import { ComboBoxChangeEvent, ComboBox } from '@progress/kendo-react-dropdowns';
import { selectors, sessionManager } from '../../store';


export const StringComboEditor = ({formID, valueSelector, update, channelName}: EditorProps) => {
  let values = [], valueToShow = undefined;
  let value = useSelector(valueSelector);
  const channel: Channel = useSelector(selectors.channel.bind(channelName));

  if (channel && channel.properties) {
    const valuesFromJSON = channel?.data?.Rows.map((row) => {
      return {
        id: row.Cells[channel.idIndex],
        name: row.Cells[channel.nameIndex],
        value: row.Cells[channel.nameIndex]
      }
    });

    if (valuesFromJSON) values = valuesFromJSON;

    if (value) {
      let stringvalue = String(value);
      let calculatedValueToShow = values.find(o => String(o.id) === stringvalue);
      if (calculatedValueToShow) {
        valueToShow = calculatedValueToShow;
      } else {
        valueToShow = '';
      }
    } else {
      valueToShow = '';
    }
  } else if (value) {
    valueToShow = {id: value, name: value, value: value};
  }

  const onOpen = () => {
    sessionManager.channelsManager.loadAllChannelData(channelName, formID, false);
  };

  const onChange = (e: ComboBoxChangeEvent) => update(e.value); // TODO: правильно ли???

  return (
    <ComboBox
      className={'parametereditor'} data={values} value={valueToShow}
      dataItemKey={'id'} textField={'name'} suggest={true}
      onOpen={onOpen} onChange={onChange}
    />
  );
};
