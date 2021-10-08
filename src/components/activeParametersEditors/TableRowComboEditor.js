import * as React from "react";
import { useSelector } from 'react-redux';
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

export default function TableRowComboEditor(props) {
    const sessionManager = useSelector((state) => state.sessionManager);
    const { id, displayName, value, selectionChanged, updatedParam, formId, dependsOn } = props;
    const [externalChannelName, setExternalChannelName] = React.useState('');
    const [values, setValues] = React.useState([]);
    const [valueToShow, setValueToShow] = React.useState(undefined);
    const [neededParameterValues, updateNeededParameterValues] = React.useReducer(neededParameterValuesReducer, { values: [], changed: false });

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

    const fetchData = React.useCallback(async () => {

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

        const responseJSON = await sessionManager.channelsManager.loadChannelData(externalChannelName, neededParameterValues.values);
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
                responseJSON.data.Columns.forEach((column, index) => {
                    valuestring += addParamRow(responseJSON.properties, column, row, index)
                });
                temp.value = valuestring;
                return temp
            });
        }
        if (valuesFromJSON && valuesFromJSON !== '') {
            setValues(valuesFromJSON);
        }
        else {
            setValues([]);
        }
    }, [neededParameterValues, externalChannelName, sessionManager]);

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
                setNewValue(calculatedValueToShow.value, false);
            }
            else {
                setValueToShow('');
            }
        }
        else {
            setValueToShow('');
        }
    }, [values, value, setNewValue]);

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
        if (updatedParam.manual) {
            if (dependsOn?.includes(updatedParam.name)) {
                if (value != null) {
                    setValueToShow(undefined);
                    setNewValue(null, true);
                }
            }
        }
    }, [updatedParam, setNewValue, dependsOn, value]);

    React.useEffect(() => {
        let ignore = false;

        async function fetchNeededParamsData() {
            const resultExternalChannelName = await sessionManager.paramsManager.loadNeededChannelForParam(id, formId ?? '');
            setExternalChannelName(resultExternalChannelName);
            const channelParams = await sessionManager.channelsManager.loadChannelParamsList(resultExternalChannelName);
            var neededParamsJSON = [];
            globals.globalParameters.forEach(element => {
                channelParams.forEach(responseParam => {
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
    }, [id, formId, sessionManager]);

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
                            setValueToShow(event.target.value);
                            setNewValue(event.target.value?.value, true);
                        }}
                    />
                </div>
            </IntlProvider>
        </LocalizationProvider>
    );
}
