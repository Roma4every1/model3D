import { useSelector, useDispatch } from 'react-redux';
import { ParameterList, updateParam } from 'entities/parameters';
import { channelDictSelector, getExternalChannels, reloadChannels } from 'entities/channels';
import { stringToTableCell } from 'entities/parameters/lib/table-row';
import { compareObjects } from 'shared/lib';


interface GlobalParamListProps {
  rootID: FormID,
  dateChanging: DateChangingPlugin,
  list: Parameter[],
}


/** Редактор глобальных параметров. */
export const GlobalParamList = ({rootID, list, dateChanging}: GlobalParamListProps) => {
  const dispatch = useDispatch();
  const externalChannels = [...getExternalChannels(list)];
  const channels = useSelector(channelDictSelector.bind(externalChannels), compareObjects);

  const dateChangingUpdate = dateChanging ? (yearValue) => {
    const columnName = dateChanging.columnName;
    const year: number = columnName
      ? parseInt(stringToTableCell(yearValue, columnName))
      : yearValue.getFullYear();

    const newValue: ParamValueDateInterval = {
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31),
    };
    dispatch(updateParam(rootID, dateChanging.dateInterval, newValue));
  } : undefined;

  const onChange = ({id, relatedChannels}: Parameter, newValue: any) => {
    dispatch(updateParam(rootID, id, newValue))
    if (relatedChannels.length) dispatch(reloadChannels(relatedChannels));
    if (dateChanging && dateChanging.year === id && newValue) dateChangingUpdate(newValue);
  };

  return <ParameterList params={list} channels={channels} onChange={onChange}/>;
};
