import { useSelector, useDispatch } from 'react-redux';
import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { BaseEditor } from './base-editor';
import { stringToTableCell } from 'entities/parameters/lib/table-row';
import { updateParam } from '../store/parameters.actions';
import { reloadChannels } from '../../channels';
import { formParamValueSelector } from '../store/parameters.selectors';
import { rootFormIDSelector, dateChangingSelector } from 'widgets/root-form';


export interface ParametersListProps {
  params: FormParameter[],
}


const filterParams = (p: FormParameter) => Boolean(p.editorType);
const sortParams = (a: FormParameter, b: FormParameter) => a.editorDisplayOrder - b.editorDisplayOrder;


/** Компонент списка параметров. */
export const ParametersList = ({params}: ParametersListProps) => {
  const dispatch = useDispatch();
  const rootFormID = useSelector(rootFormIDSelector);
  const dateChanging = useSelector(dateChangingSelector);

  const dateChangingUpdate = dateChanging ? (yearValue) => {
    const columnName = dateChanging.columnName;
    const year: number = columnName
      ? parseInt(stringToTableCell(yearValue, columnName))
      : yearValue.getFullYear();

    const newValue: ParamValueDateInterval = {
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31),
    };
    dispatch(updateParam(rootFormID, dateChanging.dateInterval, newValue));
  } : undefined;

  const paramToEditor = (param: FormParameter, i: number) => {
    // @ts-ignore
    const { id, formID, externalChannelName: channelName, relatedChannels } = param;
    const isYearParam = dateChanging && dateChanging.year === id;
    const valueSelector = formParamValueSelector.bind({id, formID});

    const update = (value: any) => {
      dispatch(updateParam(formID, id, value))
      dispatch(reloadChannels(relatedChannels));
      if (isYearParam && value) dateChangingUpdate(value);
    };

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
