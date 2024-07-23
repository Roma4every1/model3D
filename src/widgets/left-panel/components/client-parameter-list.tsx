import { useChannelDict } from 'entities/channel';
import { ParameterList, updateParamDeep } from 'entities/parameter';


interface ClientParameterListProps {
  list: Parameter[];
}


/** Список глобальных параметров или параметров презентации. */
export const ClientParameterList = ({list}: ClientParameterListProps) => {
  const channelIDs = getParameterChannels(list);
  const channels = useChannelDict(channelIDs);

  const onChange = (parameter: Parameter, newValue: any) => {
    updateParamDeep(parameter.id, newValue).then();
  };
  return <ParameterList list={list} channels={channels} onChange={onChange}/>;
};

/** Возвращает ID каналов, необходимых для параметров. */
function getParameterChannels(parameters: Parameter[]): Set<ChannelID> {
  const ids: Set<ChannelID> = new Set();
  for (const parameter of parameters) {
    const id = parameter.channelID;
    if (id) ids.add(id);
  }
  return ids;
}
