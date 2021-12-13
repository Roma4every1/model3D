import * as React from "react";
import { useSelector } from 'react-redux';
import { ComboBox } from "@progress/kendo-react-dropdowns";
var _ = require("lodash");

export default function StringComboEditorView(props) {
    const { id, selectionChanged, value, externalChannelName } = props;
    var values = [];
    var valueToShow = undefined;

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
            let calculatedValueToShow = _.find(values, function (o) { return String(o.id) === stringvalue; });
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

    return (
        <ComboBox className='parametereditor'
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
