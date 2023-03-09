import { useSelector, useDispatch } from 'react-redux';
import { ParameterList, updateParam } from 'entities/parameters';
import { channelDictSelector, reloadChannels, getExternalChannels } from 'entities/channels';
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

  const onChange = ({id, relatedChannels}: Parameter, newValue: any) => {
    dispatch(updateParam(activeID, id, newValue))
    if (relatedChannels.length) dispatch(reloadChannels(relatedChannels));
  };

  return <ParameterList params={list ?? []} channels={channels} onChange={onChange}/>;
};
