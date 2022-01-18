import * as React from "react";
import { useSelector } from 'react-redux';
import { ComboBox } from "@progress/kendo-react-dropdowns";
var _ = require("lodash");
var utils = require("../../utils");

export default function TableRowComboEditor(props) {
    const { id, formId, selectionChanged, externalChannelName } = props;
    var values = [];
    var valueToShow = undefined;
    const value = useSelector((state) => state.formParams[formId].find((gp) => gp.id === id).value);
    const nullDisplayValue = useSelector((state) => state.formParams[formId].find((gp) => gp.id === id).nullDisplayValue);
    const showNullValue = useSelector((state) => state.formParams[formId].find((gp) => gp.id === id).showNullValue);
    const sessionManager = useSelector((state) => state.sessionManager);

    const setNewValue = React.useCallback(
        (value, manual) => {
            var newevent = {};
            newevent.target = {};
            newevent.target.name = id;
            newevent.target.manual = manual;
            newevent.target.value = value;
            selectionChanged(newevent);
        },
        [id, selectionChanged],
    );

    const valuesToSelect = useSelector((state) => state.channelsData[externalChannelName]);

    if (valuesToSelect && valuesToSelect.properties) {
        const valuesFromJSON = valuesToSelect?.data?.Rows?.map((row) => utils.tableRowToString(valuesToSelect, row));

        if (valuesFromJSON && valuesFromJSON !== '') {
            values = valuesFromJSON;
        }
        else {
            values = [];
        }
        if (showNullValue) {
            values.push({
                id: null,
                name: nullDisplayValue ?? 'Нет значения',
                value: null
            })
        }

        if (value) {
            let dataId = utils.stringToTableCell(value, 'LOOKUPCODE');
            let calculatedValueToShow = _.find(values, o => String(o.id) === dataId);
            if (calculatedValueToShow) {
                valueToShow = calculatedValueToShow;
            }
            else {
                valueToShow = '';
            }
        }
        else {
            valueToShow = {
                id: value,
                name: nullDisplayValue ?? '',
                value: value
            };
        }
    }
    else if (value) {
        let dataId = utils.stringToTableCell(value, 'LOOKUPCODE');
        let dataValue = utils.stringToTableCell(value, 'LOOKUPVALUE');
        valueToShow = {
            id: dataId,
            name: dataValue,
            value: value
        };
    }
    else if (nullDisplayValue) {
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
            onChange={(event) => {
                valueToShow = event.target.value;
                setNewValue(event.target.value?.value, true);
            }}
        />
    );
}
