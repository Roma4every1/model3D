import { getEditor } from './editor-dict';
import './parameters.scss';


export interface ParameterListProps {
  list: Parameter[],
  channels: ChannelDict,
  onChange?: (parameter: Parameter, newValue: any) => void,
}


/** Компонент списка параметров. */
export const ParameterList = ({list, onChange, channels}: ParameterListProps) => {
  const toElement = (parameter: Parameter, i: number) => {
    const channelName = parameter.externalChannelName;
    const channel = channelName ? channels[channelName] : undefined;
    const update = (value: any) => { onChange(parameter, value); };

    const Editor = getEditor(parameter, channel);
    if (!Editor) return null;

    return (
      <div key={i} className={'parameter'}>
        <span>{parameter.displayName}</span>
        <Editor parameter={parameter} update={update} channel={channel}/>
      </div>
    );
  };
  return <div>{list.map(toElement)}</div>;
};
