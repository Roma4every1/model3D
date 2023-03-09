import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { BaseEditor } from './base-editor';


export interface ParametersListProps {
  params: Parameter[],
  channels: ChannelDict,
  onChange?: (param: Parameter, newValue: any) => void,
}


const filterParams = (p: Parameter) => Boolean(p.editorType);
const sortParams = (a: Parameter, b: Parameter) => a.editorDisplayOrder - b.editorDisplayOrder;


/** Компонент списка параметров. */
export const ParameterList = ({params, onChange, channels}: ParametersListProps) => {
  const paramToEditor = (parameter: Parameter, i: number) => {
    const channelName = parameter.externalChannelName;
    const channel = channelName ? channels[channelName] : undefined;
    const update = (value: any) => { onChange(parameter, value); };
    return <BaseEditor key={i} parameter={parameter} update={update} channel={channel}/>;
  };

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        <div className={'parameters-list'}>
          {params.filter(filterParams).sort(sortParams).map(paramToEditor)}
        </div>
      </IntlProvider>
    </LocalizationProvider>
  );
};
