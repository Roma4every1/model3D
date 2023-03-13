import { useSelector, useDispatch } from 'react-redux';
import { ParameterList, updateParamDeep } from 'entities/parameters';
import { channelDictSelector, getExternalChannels } from 'entities/channels';
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
    dispatch(updateParamDeep(rootID, dateChanging.dateInterval, newValue));
  } : undefined;

  const onChange = ({id}: Parameter, newValue: any) => {
    dispatch(updateParamDeep(rootID, id, newValue));
    if (dateChanging?.year === id && newValue) dateChangingUpdate(newValue);
  };

  return <ParameterList params={list} channels={channels} onChange={onChange}/>;
};
