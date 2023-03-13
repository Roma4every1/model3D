import { useSelector, useDispatch } from 'react-redux';
import { ParameterList, updateParamDeep } from 'entities/parameters';
import { channelDictSelector, getExternalChannels } from 'entities/channels';
import { compareObjects } from 'shared/lib';


interface PresentationParamListProps {
  list: Parameter[],
  activeID: FormID,
}


/** Редактор параметров текущей презентации. */
export const PresentationParamList = ({list, activeID}: PresentationParamListProps) => {
  const dispatch = useDispatch();
  const externalChannels = list ? [...getExternalChannels(list)] : [];
  const channels = useSelector(channelDictSelector.bind(externalChannels), compareObjects);

  const onChange = (parameter: Parameter, newValue: any) => {
    dispatch(updateParamDeep(activeID, parameter.id, newValue));
  };

  return <ParameterList params={list ?? []} channels={channels} onChange={onChange}/>;
};
