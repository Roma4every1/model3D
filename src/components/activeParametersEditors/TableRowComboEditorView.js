import * as React from "react";
import { useSelector } from 'react-redux';
import { Label } from "@progress/kendo-react-labels";
import { ComboBox } from "@progress/kendo-react-dropdowns";
import {
    IntlProvider,
    LocalizationProvider,
    loadMessages,
} from "@progress/kendo-react-intl";
import ruMessages from "./ru.json";
loadMessages(ruMessages, "ru");
var _ = require("lodash");

export default function TableRowComboEditorView(props) {
    const { id, displayName, selectionChanged, value, externalChannelName } = props;
    var values = [];
    var valueToShow = undefined;

    const addParamRow = (properties, column, row, index) => {
        var result = '';
        if (index !== 0) {
            result = '|'
        }
        result += addParam(column, row.Cells[index], column.Name.toUpperCase());
        var propName = _.find(properties, function (o) { return o.fromColumn?.toUpperCase() === column.Name.toUpperCase(); });
        if (propName) {
            result += '|' + addParam(column, row.Cells[index], propName.name.toUpperCase());
        }
        return result;
    }

    const addParam = (column, rowValue, propName) => {
        var valuestring = '';
        if (rowValue != null) {
            valuestring = propName + '#' + rowValue + '#' + column.NetType;
        }
        else {
            valuestring = propName + '##System.DBNull';
        }
        return valuestring;
    }

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

    const valuesToSelect = useSelector((state) => state.sessionManager.channelsManager.getChannelData(externalChannelName));

    if (valuesToSelect && valuesToSelect.properties) {
        const valuesFromJSON = valuesToSelect.data.Rows.map((row) => {
            let temp = {};
            temp.id = row.Cells[valuesToSelect.idIndex];
            temp.name = row.Cells[valuesToSelect.nameIndex];
            var valuestring = '';
            valuesToSelect.data.Columns.forEach((column, index) => {
                valuestring += addParamRow(valuesToSelect.properties, column, row, index)
            });
            temp.value = valuestring;
            return temp
        });

        if (valuesFromJSON && valuesFromJSON !== '') {
            values = valuesFromJSON;
        }
        else {
            values = [];
        }

        if (value) {
            let stringvalue = String(value);
            const startIndex = stringvalue.indexOf('LOOKUPCODE#');
            var finishIndex = stringvalue.indexOf('#', startIndex + 11);
            let dateValue;
            if (startIndex === -1) {
                dateValue = stringvalue;
            }
            else if (finishIndex === -1) {
                dateValue = stringvalue.slice(startIndex + 11);
            }
            else {
                dateValue = stringvalue.slice(startIndex + 11, finishIndex);
            }
            let calculatedValueToShow = _.find(values, function (o) { return String(o.id) === dateValue; });
            if (calculatedValueToShow) {
                valueToShow = calculatedValueToShow;
               // setNewValue(calculatedValueToShow.value, false);
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
        <LocalizationProvider language='ru-RU'>
            <IntlProvider locale='ru'>
                <div className='parametereditorbox'>
                    <Label className='parameterlabel' editorId={id}>{displayName}</Label>
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
                </div>
            </IntlProvider>
        </LocalizationProvider>
    );
}
