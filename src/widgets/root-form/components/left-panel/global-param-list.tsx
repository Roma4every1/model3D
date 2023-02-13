import { useSelector, useDispatch } from 'react-redux';
import { ParameterList, updateParam } from 'entities/parameters';
import { reloadChannels } from 'entities/channels';
import { stringToTableCell } from 'entities/parameters/lib/table-row';
import { rootFormStateSelector, globalParamsSelector } from '../../store/root-form.selectors';


/** Редактор глобальных параметров. */
export const GlobalParamList = () => {
  const dispatch = useDispatch();
  const rootFormState = useSelector(rootFormStateSelector);
  const globalParams = useSelector(globalParamsSelector);

  const rootFormID = rootFormState.id;
  const dateChanging = rootFormState.settings.dateChanging;

  const dateChangingUpdate = dateChanging ? (yearValue) => {
    const columnName = dateChanging.columnName;
    const year: number = columnName
      ? parseInt(stringToTableCell(yearValue, columnName))
      : yearValue.getFullYear();

    const newValue: ParamValueDateInterval = {
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31),
    };
    dispatch(updateParam(rootFormID, dateChanging.dateInterval, newValue));
  } : undefined;

  const onChange = ({id, relatedChannels}: Parameter, newValue: any) => {
    dispatch(updateParam(rootFormID, id, newValue))
    if (relatedChannels.length) dispatch(reloadChannels(relatedChannels));
    if (dateChanging && dateChanging.year === id && newValue) dateChangingUpdate(newValue);
  };

  return <ParameterList params={globalParams} onChange={onChange}/>;
};
