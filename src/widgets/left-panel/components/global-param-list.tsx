import { useSelector, useDispatch, compareObjects } from 'shared/lib';
import { ParameterList, updateParamDeep } from 'entities/parameters';
import { channelDictSelector, getExternalChannels } from 'entities/channels';
import { stringToTableCell } from 'entities/parameters/lib/table-row';


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

  const dateChangingUpdate = dateChanging ? (value: any, type: ParameterType) => {
    if (value === null) return;
    let year: number;

    if (type === 'date') {
      year = value.getFullYear();
    } else if (type === 'tableRow' && dateChanging.columnName) {
      year = parseInt(stringToTableCell(value, dateChanging.columnName))
    } else if (type === 'integer') {
      year = value;
    }
    if (year === undefined) return;

    const newInterval: ParamValueDateInterval = {
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31),
    };
    dispatch(updateParamDeep(rootID, dateChanging.dateInterval, newInterval));
  } : undefined;

  const onChange = ({id, type}: Parameter, newValue: any) => {
    dispatch(updateParamDeep(rootID, id, newValue));
    if (dateChanging?.year === id) dateChangingUpdate(newValue, type);
  };

  return <ParameterList params={list} channels={channels} onChange={onChange}/>;
};
