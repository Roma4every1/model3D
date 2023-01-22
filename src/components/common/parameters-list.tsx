import { useSelector, useDispatch } from "react-redux";
import { BaseEditor } from "../editors/base-editor";
import { stringToTableCell } from "../../utils/utils";
import { selectors, actions } from "../../store";
import { IntlProvider, LocalizationProvider } from "@progress/kendo-react-intl";


const dateChangingSelector = (state: WState): DateChangingPlugin => {
  const rootFormID = state.appState.rootFormID;
  const settings = state.formSettings[rootFormID] as DockFormSettings;
  return settings.dateChanging;
};

const filterParams = (p: FormParameter) => Boolean(p.editorType);
const sortParams = (a: FormParameter, b: FormParameter) => a.editorDisplayOrder - b.editorDisplayOrder;


/** Компонент списка параметров. */
export default function ParametersList({parametersJSON}: {parametersJSON: FormParameter[]}) {
  const dispatch = useDispatch();
  const rootFormID = useSelector(selectors.rootFormID);
  const dateChanging = useSelector(dateChangingSelector);

  const dateChangingUpdate = (yearValue) => {
    const { dateIntervalParameter, columnName } = dateChanging;
    const year: number = columnName
      ? parseInt(stringToTableCell(yearValue, columnName))
      : yearValue.getFullYear();

    const newValue: ParamValueDateInterval = {
      start: new Date(year, 0, 0),
      end: new Date(year, 11, 31),
    };
    dispatch(actions.updateParam(rootFormID, dateIntervalParameter, newValue));
  };

  const paramToEditor = (param: FormParameter, i: number) => {
    // @ts-ignore
    const { id, formID, externalChannelName: channelName } = param;
    const isYearParam = dateChanging && dateChanging.yearParameter === id;
    const valueSelector = selectors.formParamValue.bind({id, formID});

    const update = (value: any) => {
      dispatch(actions.updateParam(formID, id, value))
      if (isYearParam) dateChangingUpdate(value);
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
          {parametersJSON.filter(filterParams).sort(sortParams).map(paramToEditor)}
        </div>
      </IntlProvider>
    </LocalizationProvider>
  );
}
