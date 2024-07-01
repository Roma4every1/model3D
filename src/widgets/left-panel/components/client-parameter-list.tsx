import { useChannelDict } from 'entities/channel';
import { ParameterList, updateParamDeep, getParameterChannels } from 'entities/parameter';


interface ClientParameterListProps {
  list: Parameter[];
}


/** Список глобальных параметров или параметров презентации. */
export const ClientParameterList = ({list}: ClientParameterListProps) => {
  const channelNames = getParameterChannels(list);
  const channels = useChannelDict(channelNames);

  const onChange = (parameter: Parameter, newValue: any) => {
    updateParamDeep(parameter.id, newValue).then();
  };
  return <ParameterList list={list} channels={channels} onChange={onChange}/>;
};
