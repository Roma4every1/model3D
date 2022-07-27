import * as React from "react";
import { useSelector } from 'react-redux';
import { ComboBox } from "@progress/kendo-react-dropdowns";


export default function StringComboEditor(props) {
    const { id, formId, selectionChanged, externalChannelName } = props;
    let values = [], valueToShow = undefined;
    const value = useSelector((state) => state.formParams[formId].find((gp) => gp.id === id).value);
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
        const valuesFromJSON = valuesToSelect?.data?.Rows.map((row) => {
            return {
                id: row.Cells[valuesToSelect.idIndex],
                name: row.Cells[valuesToSelect.nameIndex],
                value: row.Cells[valuesToSelect.nameIndex]
            }
        });

        if (valuesFromJSON && valuesFromJSON !== '') {
            values = valuesFromJSON;
        }
        else {
            values = [];
        }

        if (value) {
            let stringvalue = String(value);
            let calculatedValueToShow = values.find(o => String(o.id) === stringvalue);
            if (calculatedValueToShow) {
                valueToShow = calculatedValueToShow;
            }
            else {
                valueToShow = '';
            }
        }
        else {
            valueToShow = '';
        }
    }
    else if (value) {
        valueToShow = {
            id: value,
            name: value,
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
