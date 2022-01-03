import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import setFormSettings from "../../../../store/actionCreators/setFormSettings";
import IntegerTextEditor from "../../../activeParametersEditors/IntegerTextEditor";
import {
    IntlProvider,
    LocalizationProvider,
    loadMessages,
} from "@progress/kendo-react-intl";
import ruMessages from "../../../locales/kendoUI/ru.json";
loadMessages(ruMessages, "ru-RU");

export default function ColumnSettings(props) {
    const dispatch = useDispatch();
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);

    const tableSettings = useSelector((state) => state.formSettings[formId]);

    const updateFrozenCount = (event) => {
        tableSettings.columns.frozenColumnCount = event.value;
        dispatch(setFormSettings(formId, { ...tableSettings }));
    };

    const moveColumnToLeft = () => {
        var cell = formRef.current.activeCell();

        if (tableSettings.columns.columnsSettings) {
            tableSettings.columns.columnsSettings.sort((a, b) => a.displayIndex - b.displayIndex);
            tableSettings.columns.columnsSettings.forEach((c, i) => c.displayIndex = i);
            let index = tableSettings.columns.columnsSettings.findIndex(c => c.channelPropertyName === cell.column);
            if (index > 0 && index < tableSettings.columns.columnsSettings.length) {
                tableSettings.columns.columnsSettings[index].displayIndex--;
                tableSettings.columns.columnsSettings[index - 1].displayIndex++;
            }
        }
        dispatch(setFormSettings(formId, { ...tableSettings }));
    };

    return (
        <div>
            <button className="k-button k-button-clear" onClick={moveColumnToLeft}>
                <span className="k-icon k-i-arrow-60-left" />
            </button>
            <LocalizationProvider language='ru-RU'>
                <IntlProvider locale='ru'>
                    <IntegerTextEditor id="frozenColumnEditor" value={tableSettings?.columns?.frozenColumnCount} selectionChanged={updateFrozenCount} />
                </IntlProvider>
            </LocalizationProvider>
        </div>);
}