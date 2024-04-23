import { ParameterList, updateParamDeep } from 'entities/parameter';
import { getExternalChannels, useChannelDict } from 'entities/channel';


interface ClientParameterListProps {
  clientID: ClientID;
  list: Parameter[];
}


/** Список глобальных параметров или параметров презентации. */
export const ClientParameterList = ({clientID, list}: ClientParameterListProps) => {
  const channelNames = getExternalChannels(list);
  const channels = useChannelDict(channelNames);

  const onChange = (parameter: Parameter, newValue: any) => {
    updateParamDeep(clientID, parameter.id, newValue).then();
  };
  return <ParameterList list={list} channels={channels} onChange={onChange}/>;
};
