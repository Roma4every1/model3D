import { useSelector, useDispatch, compareObjects } from 'shared/lib';
import { ParameterList, updateParamDeep } from 'entities/parameters';
import { channelDictSelector, getExternalChannels } from 'entities/channels';


interface ClientParameterListProps {
  clientID: ClientID;
  list: Parameter[];
}


/** Редактор глобальный параметров или параметров презентации. */
export const ClientParameterList = ({clientID, list}: ClientParameterListProps) => {
  const dispatch = useDispatch();
  const externalChannels = [...getExternalChannels(list)];
  const channels = useSelector(channelDictSelector.bind(externalChannels), compareObjects);

  const onChange = (parameter: Parameter, newValue: any) => {
    dispatch(updateParamDeep(clientID, parameter.id, newValue));
  };
  return <ParameterList params={list} channels={channels} onChange={onChange}/>;
};
