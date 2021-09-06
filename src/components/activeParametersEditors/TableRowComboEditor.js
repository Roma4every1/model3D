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
    const { id, displayName, value, selectionChanged, updatedParam } = props;
    const [values, setValues] = React.useState([]);
    const [valueToShow, setValueToShow] = React.useState(undefined);
    const [neededParameterValues, updateNeededParameterValues] = React.useReducer(neededParameterValuesReducer, { values: [], changed: false });

    const fetchData = React.useCallback(async () => {
        const jsonParamaters = JSON.stringify(neededParameterValues.values).replaceAll('#', '%23');
        const response = await utils.webFetch(`getChannelDataForParam?sessionId=${globals.sessionId}&paramName=${id}&paramValues=${jsonParamaters}`);
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
                temp.id = 'LOOKUPCODE#' + row.Cells[idIndex] + '#' + responseJSON.data.Columns[idIndex].NetType;
                temp.name = row.Cells[nameIndex];
                return temp
            });
        }
        if (valuesFromJSON && valuesFromJSON !== '') {
            setValues(valuesFromJSON);
        }
    }, [id, neededParameterValues]);

    React.useEffect(() => {
        if (value) {
            const startIndex = value.indexOf('LOOKUPCODE');
            var finishIndex = value.indexOf('|', startIndex);
            let dateValue;
            if (finishIndex === -1) {
                dateValue = value.slice(startIndex);
            }
            else {
                dateValue = value.slice(startIndex, finishIndex);
            }
            let calculatedValueToShow = _.find(values, function (o) { return o.id === dateValue; });
            if (calculatedValueToShow) {
                setValueToShow(calculatedValueToShow);
                var newevent = {};
                newevent.target = {};
                newevent.target.name = id;
                newevent.target.value = calculatedValueToShow.id;
                selectionChanged(newevent);
            }
            else {
                setValueToShow(undefined);
            }
        }
    }, [values, value, id, selectionChanged]);

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
            const response = await utils.webFetch(`getNeededParamForParam?sessionId=${globals.sessionId}&paramName=${id}`);
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
    }, [id]);

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
                            newevent.target.value = event.target.value?.id;
                            selectionChanged(newevent)
                        }}
                    />
                </div>
            </IntlProvider>
        </LocalizationProvider>
    );
}
