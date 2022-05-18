import * as React from "react";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ComboBox } from "@progress/kendo-react-dropdowns";
import { stringToTableCell, tableRowToString } from "../../utils";


export default function TableRowComboEditor(props) {
    const { t } = useTranslation();
    const { id, formId, selectionChanged, externalChannelName } = props;
    let values = [];
    let valueToShow = undefined;
    const value = useSelector((state) => state.formParams[formId].find((gp) => gp.id === id).value);
    const nullDisplayValue = useSelector((state) => state.formParams[formId].find((gp) => gp.id === id).nullDisplayValue ?? t("editors.activeObjectNullDisplayName"));
    const showNullValue = useSelector((state) => state.formParams[formId].find((gp) => gp.id === id).showNullValue);
    const sessionManager = useSelector((state) => state.sessionManager);

    const setNewValue = React.useCallback((value, manual) => {
            const newEvent = {};
            newEvent.target = {};
            newEvent.target.name = id;
            newEvent.target.manual = manual;
            newEvent.target.value = value;
            selectionChanged(newEvent);
        },
        [id, selectionChanged],
    );

    const valuesToSelect = useSelector((state) => state.channelsData[externalChannelName]);

    if (valuesToSelect && valuesToSelect.properties) {
        const valuesFromJSON = valuesToSelect?.data?.Rows?.map((row) => tableRowToString(valuesToSelect, row));

        values = (valuesFromJSON && valuesFromJSON !== '') ? valuesFromJSON : [];

        if (showNullValue) {
            values.push({id: null, name: nullDisplayValue, value: null})
        }

        if (value) {
            const dataId = stringToTableCell(value, 'LOOKUPCODE');
            const calculatedValueToShow = values.find(o => String(o.id) === dataId);
            valueToShow = calculatedValueToShow ? calculatedValueToShow : '';
        }
        else if (showNullValue) {
            valueToShow = {id: value, name: nullDisplayValue, value: value};
        }
    }
    else if (value) {
        valueToShow = {
            id: stringToTableCell(value, 'LOOKUPCODE'),
            name: stringToTableCell(value, 'LOOKUPVALUE'),
            value: value
        };
    }
    else if (showNullValue) {
        valueToShow = {
            id: value,
            name: nullDisplayValue,
            value: value
        };
    }

    const onOpen = () => {
        sessionManager.channelsManager.loadAllChannelData(externalChannelName, formId, false);
    };

    return (
        <ComboBox className='parametereditor'
            onOpen={onOpen}
            suggest={true}
            name={id}
            data={values}
            value={valueToShow}
            dataItemKey="id"
            textField="name"
            placeholder={nullDisplayValue}
            onChange={(event) => {
                valueToShow = event.target.value;
                setNewValue(event.target.value?.value, true);
            }}
        />
    );
}
