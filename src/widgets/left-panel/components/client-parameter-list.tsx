import type { TabsProps } from 'antd';
import { Tabs } from 'antd';
import { useChannelDict } from 'entities/channel';
import { ParameterList, getParameterStorage, updateParamDeep } from 'entities/parameter';


interface ClientParameterListProps {
  list: Parameter[];
  groups?: ParameterGroup[];
  channelIDs?: Iterable<ChannelID>;
}
type TabProps = TabsProps['items'][number];


/** Список глобальных параметров или параметров презентации. */
export const ClientParameterList = ({list, groups, channelIDs}: ClientParameterListProps) => {
  if (!channelIDs) channelIDs = getParameterChannels(list);
  const channels = useChannelDict(channelIDs);

  const onChange = (parameter: Parameter, newValue: any) => {
    updateParamDeep(parameter.id, newValue).then();
  };
  if (!groups) return <ParameterList list={list} channels={channels} onChange={onChange}/>;
  const storage = getParameterStorage();

  const toTab = (group: ParameterGroup): TabProps => {
    const groupList = group.parameters.map(id => storage.get(id));
    const children = <ParameterList list={groupList} channels={channels} onChange={onChange}/>;
    return {key: group.id, label: group.name, children};
  };
  return <Tabs rootClassName={'parameter-groups'} items={groups.map(toTab)}/>;
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
