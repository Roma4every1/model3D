import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { createElement } from 'react';
import { EditorProps, handleParameterList } from './editor-dict.ts';
import './parameters.scss';


export interface ParameterListProps {
  list: Parameter[],
  channels: ChannelDict,
  onChange?: (parameter: Parameter, newValue: any) => void,
}


/** Компонент списка параметров. */
export const ParameterList = ({list, onChange, channels}: ParameterListProps) => {
  if (list.length > 0 && list[0].editor === undefined) {
    handleParameterList(list);
  }

  const toElement = (parameter: Parameter, i: number) => {
    const channelName = parameter.externalChannelName;
    const channel = channelName ? channels[channelName] : undefined;
    const update = (value: any) => { onChange(parameter, value); };

    return (
      <div key={i} className={'parameter'}>
        <span>{parameter.displayName}</span>
        {createElement<EditorProps>(parameter.editor, {parameter, update, channel})}
      </div>
    );
  };

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        <div>{list.filter(p => Boolean(p.editor)).map(toElement)}</div>
      </IntlProvider>
    </LocalizationProvider>
  );
};
