import * as React from "react";
import { Label } from "@progress/kendo-react-labels";
import { ComboBox } from "@progress/kendo-react-dropdowns";
import { globals } from '../Globals';
import {
    IntlProvider,
    LocalizationProvider,
    loadMessages,
} from "@progress/kendo-react-intl";
import ruMessages from "./ru.json";
loadMessages(ruMessages, "ru");
var _ = require("lodash");
var utils = require("../../utils")

export default function TableRowComboEditor(props) {
    const { id, displayName, value, selectionChanged, updatedParam , programId} = props;
    const [values, setValues] = React.useState([]);
    const [valueToShow, setValueToShow] = React.useState(undefined);
    const [neededParameterValues, updateNeededParameterValues] = React.useReducer(neededParameterValuesReducer, { values: [], changed: false });

    const fetchData = React.useCallback(async () => {
        var jsonToSend = { sessionId: globals.sessionId, paramName: id, reportId: programId, paramValues: neededParameterValues.values };
        const jsonToSendString = JSON.stringify(jsonToSend);
        const response = await utils.webFetch(`getChannelDataForParam`,
            {
                method: 'POST',
                body: jsonToSendString
            });
        const responseJSON = await response.json();
        let valuesFromJSON = '';
        if (responseJSON && responseJSON.properties) {
            let idIndex = 0;
            let nameIndex = 0;
            responseJSON.properties.forEach(property => {
                if (property.name.toUpperCase() === 'LOOKUPCODE') {
                    idIndex = _.findIndex(responseJSON.data.Columns, function (o) { return o.Name === property.fromColumn; });
                }
                else if (property.name.toUpperCase() === 'LOOKUPVALUE') {
                    nameIndex = _.findIndex(responseJSON.data.Columns, function (o) { return o.Name === property.fromColumn; });
                }
            });
            valuesFromJSON = responseJSON.data.Rows.map((row) => {
                let temp = {};
                temp.id = row.Cells[idIndex];
                temp.name = row.Cells[nameIndex];

                var valuestring = '';
                valuestring = addParam(row, responseJSON, responseJSON.data.Columns[0].Name, 0);
                var propName = _.find(responseJSON.properties, function (o) { return o.fromColumn?.toUpperCase() === responseJSON.data.Columns[0].Name.toUpperCase(); });
                if (propName) {
                    valuestring += '|' + addParam(row, responseJSON, propName.name.toUpperCase(),  0);
                }
                for (var i = 1; i < responseJSON.data.Columns.length; i++) {
                    valuestring += '|' + addParam(row, responseJSON, responseJSON.data.Columns[i].Name, i);
                    var propName2 = _.find(responseJSON.properties, function (o) { return o.fromColumn?.toUpperCase() === responseJSON.data.Columns[i].Name.toUpperCase(); });
                    if (propName2) {
                        valuestring += '|' + addParam(row, responseJSON, propName2.name.toUpperCase(), i);
                    }
                }
                temp.value = valuestring;
                return temp
            });
        }
        if (valuesFromJSON && valuesFromJSON !== '') {
            setValues(valuesFromJSON);
        }
    }, [id, neededParameterValues, programId]);

    React.useEffect(() => {
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
                setValueToShow(calculatedValueToShow);
                var newevent = {};
                newevent.target = {};
                newevent.target.name = id;
                newevent.target.value = calculatedValueToShow.value;
                selectionChanged(newevent);
            }
            else {
                setValueToShow(undefined);
            }
        }
    }, [values, value, id, selectionChanged]);

    function addParam(row, responseJSON, propName, index) {
        var valuestring = '';
        if (row.Cells[index] != null) {
            valuestring = propName + '#' + row.Cells[index] + '#' + responseJSON.data.Columns[index].NetType;
        }
        else {
            valuestring = propName + '##System.DBNull';
        }
        return valuestring;
    }

    function neededParameterValuesReducer(state, action) {
        if (action.updatedParam) {
            var neededParamsJSON = state.values;
            var neededParamJSON = _.find(neededParamsJSON, function (o) { return o.id === action.updatedParam.name; });
            if (neededParamJSON) {
                neededParamJSON.value = action.updatedParam.value;
                return ({ values: neededParamsJSON, changed: true });
            }
            return ({ values: state.values, changed: false });
        }
        else {
            return ({ values: action.newValues, changed: true });
        }
    }

    React.useEffect(() => {
        if (neededParameterValues.changed) {
            fetchData();
        }
    }, [neededParameterValues, fetchData]);

    React.useEffect(() => {
        updateNeededParameterValues({ updatedParam: updatedParam });
    }, [updatedParam]);

    React.useEffect(() => {
        let ignore = false;

        async function fetchNeededParamsData() {
            var response;
            if (programId) {
                response = await utils.webFetch(`getNeededParamForParam?sessionId=${globals.sessionId}&paramName=${id}&reportId=${programId}`);
            }
            else {
                response = await utils.webFetch(`getNeededParamForParam?sessionId=${globals.sessionId}&paramName=${id}`);
            }
            const responseJSON = await response.json();
            var neededParamsJSON = [];
            globals.globalParameters.forEach(element => {
                responseJSON.forEach(responseParam => {
                    if (element.id === responseParam) {
                        neededParamsJSON.push(element);
                    }
                });
            });
            if (!ignore) {
                updateNeededParameterValues({ newValues: neededParamsJSON });
            }
        }

        fetchNeededParamsData();
        return () => { ignore = true; }
    }, [id, programId]);

    return (
        <LocalizationProvider language='ru-RU'>
            <IntlProvider locale='ru'>
                <div className='parametereditorbox'>
                    <Label className='parameterlabel' editorId={id}>{displayName}</Label>
                    <ComboBox className='parametereditor'
                        name={id}
                        data={values}
                        value={valueToShow}
                        dataItemKey="id"
                        textField="name"
                        onChange={(event) => {
                            setValueToShow(event.target.value);
                            var newevent = {};
                            newevent.target = {};
                            newevent.target.name = event.target.name;
                            newevent.target.value = event.target.value?.value;
                            selectionChanged(newevent)
                        }}
                    />
                </div>
            </IntlProvider>
        </LocalizationProvider>
    );
}
