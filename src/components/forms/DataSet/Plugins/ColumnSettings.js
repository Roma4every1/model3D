import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Popup } from "@progress/kendo-react-popup";
import { TreeView } from "@progress/kendo-react-treeview";
import { Button } from "@progress/kendo-react-buttons";
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
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);
    const [popoverState, setPopoverState] = React.useState({
        anchorEl: null,
        open: false
    });

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

    const showColumnListClick = (event) => {
        setPopoverState({
            anchorEl: event.currentTarget,
            open: !popoverState.open,
        });
    };

    const [tree, setTree] = React.useState(formRef?.current?.properties()?.map(property => {
        return {
            id: property.name,
            text: property.displayName,
            checked: (tableSettings?.attachedProperties?.attachOption !== "AttachNothing") ?
                !tableSettings?.attachedProperties?.exclude.includes(property.name) :
                tableSettings?.attachedProperties?.exclude.includes(property.name)
        }
    }));

    const onCheckChange = (event) => {
        event.item.checked = !event.item.checked;
        setTree([...tree]);
        if (tableSettings?.attachedProperties?.attachOption !== "AttachNothing") {
            tableSettings.attachedProperties.exclude = tree.filter(ti => !ti.checked).map(ti => ti.id);
        }
        else {
            tableSettings.attachedProperties.exclude = tree.filter(ti => ti.checked).map(ti => ti.id);
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
            <Button className="actionbutton" onClick={showColumnListClick}>
                {t('table.columnsVisibility')}
            </Button>
            <Popup className="popup"
                id={formId}
                show={popoverState.open}
                anchor={popoverState.anchorEl}
            >
                <TreeView className="popuptreeview"
                    data={tree}
                    checkboxes={true}
                    onCheckChange={onCheckChange}
                >
                </TreeView>
            </Popup>
        </div>);
}