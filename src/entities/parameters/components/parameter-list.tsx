import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { BaseEditor } from './base-editor';
import { formParamValueSelector } from '../store/parameters.selectors';


export interface ParametersListProps {
  params: Parameter[],
  onChange?: (param: Parameter, newValue: any) => void,
}


const filterParams = (p: Parameter) => Boolean(p.editorType);
const sortParams = (a: Parameter, b: Parameter) => a.editorDisplayOrder - b.editorDisplayOrder;


/** Компонент списка параметров. */
export const ParameterList = ({params, onChange}: ParametersListProps) => {
  const paramToEditor = (param: Parameter, i: number) => {
    const { id, formID, externalChannelName: channelName } = param;
    const valueSelector = formParamValueSelector.bind({id, formID});
    const update = (value: any) => { onChange(param, value); };

    return (
      <BaseEditor
        key={i} type={param.editorType} displayName={param.displayName}
        editorProps={{id, formID, channelName, valueSelector, update}}
      />
    );
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
