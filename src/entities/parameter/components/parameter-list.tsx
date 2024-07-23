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
    const editorOptions = parameter.editor;
    if (!editorOptions) return null;

    const channelID = parameter.channelID;
    const channel = channelID ? channels[channelID] : undefined;
    const update = (value: any) => onChange(parameter, value);
    const Editor = getEditor(parameter, channel);

    return (
      <div key={i} className={'parameter'}>
        <span>{editorOptions.displayName}</span>
        <Editor parameter={parameter} update={update} channel={channel}/>
      </div>
    );
  };
  return <div>{list.map(toElement)}</div>;
};
