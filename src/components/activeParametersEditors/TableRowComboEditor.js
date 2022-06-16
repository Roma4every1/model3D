import * as React from "react";
import {useDispatch, useSelector} from "react-redux";
import { useTranslation } from "react-i18next";
import { ComboBox } from "@progress/kendo-react-dropdowns";
import { stringToTableCell, tableRowToString } from "../../utils";
import setParamState from "../../store/actionCreators/setParamState";


/*
props {
  displayName: string,
  editorType: string,
  externalChannelName: string,
  formId: string,
  formIdToLoad: any,
  id: string,
  selectionChanged: function,
  value: any,
}
*/

/*
KendoReact ComboBox props {
  name: string, // задает свойство имени входного элемента DOM
  data: any[], // список возможных вариантов
  value: any, // значение ComboBox; может быть примитивным или сложным (напр. объект)
  suggest: boolean, // автозаполнение текста на основе первого элемента данных
  allowCustom: boolean, // возможность установить значение не из предлагаемых
  placeholder: string, // подсказка, которая отображается, когда ComboBox пуст
  onOpen: function, // срабатывает, когда всплывающее окно ComboBox вот-вот откроется.
  onChange: function, // срабатывает каждый раз, когда значение ComboBox собирается измениться
}
*/


export default function TableRowComboEditor(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { id, formId, selectionChanged, externalChannelName } = props;
  let values = [], valueToShow = undefined;

  const sessionManager = useSelector((state) => {
    // if (props.displayName === 'Месторождение') {
    //   //console.log('props', props);
    //   console.log('state', state);
    // }
    return state.sessionManager;
  });

  const formParameter = useSelector((state) => state.formParams[formId].find((gp) => gp.id === id));
  const valuesToSelect = useSelector((state) => state.channelsData[externalChannelName]);

  const value = formParameter.value;
  const nullDisplayValue = formParameter.nullDisplayValue ?? t("editors.activeObjectNullDisplayName");
  const showNullValue = formParameter.showNullValue;

  if (valuesToSelect && valuesToSelect.properties) {
    const valuesFromJSON = valuesToSelect?.data?.Rows?.map((row) => tableRowToString(valuesToSelect, row));

    values = (valuesFromJSON) ? valuesFromJSON : [];

    if (showNullValue) {
      values.push({id: null, name: nullDisplayValue, value: null})
    }

    if (value) {
      const dataId = stringToTableCell(value, 'LOOKUPCODE');
      const calculatedValueToShow = values.find(o => String(o.id) === dataId);
      valueToShow = calculatedValueToShow ? calculatedValueToShow : '';
    } else if (showNullValue) {
      valueToShow = {id: value, name: nullDisplayValue, value: value};
    }
  } else if (value) {
    valueToShow = {
      id: stringToTableCell(value, 'LOOKUPCODE'),
      name: stringToTableCell(value, 'LOOKUPVALUE'),
      value: value
    };
  } else if (showNullValue) {
    valueToShow = {id: value, name: nullDisplayValue, value: value};
  }

  const [readyValueToShow, setReadyValueToShow] = React.useState(valueToShow);

  React.useEffect(() => {
    dispatch(setParamState(formId, id, {value: readyValueToShow, setValue: setReadyValueToShow}));
  }, [readyValueToShow, setReadyValueToShow, formId, id, dispatch]);

  const setNewValue = React.useCallback((value, manual) => {
    selectionChanged({target: {name: id, manual, value}});
  }, [id, selectionChanged]);

  // event: ComboBoxChangeEvent
  const onChange = (event) => {
    setReadyValueToShow(event.target.value);
    setNewValue(event.target.value?.value, true);
  }

  const onOpen = () => {
    sessionManager.channelsManager.loadAllChannelData(externalChannelName, formId, false).then();
  };

  return (
    <ComboBox
      className='parametereditor' dataItemKey="id" textField="name"
      name={id} data={values}
      value={readyValueToShow} placeholder={nullDisplayValue}
      suggest={true} allowCustom={true}
      onChange={onChange} onOpen={onOpen}
    />
  );
}
