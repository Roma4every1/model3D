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
    const [neededParameterValues, setNeededParameterValues] = React.useState([]);

    function setNewValues(newValues) {
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
            let calculatedValueToShow = _.find(newValues, function (o) { return o.id === dateValue; });
            if (calculatedValueToShow) {
                setValueToShow(calculatedValueToShow);
                var newevent = {};
                newevent.target = {};
                newevent.target.name = id
                newevent.target.value = calculatedValueToShow.id
                selectionChanged(newevent)
            }
            else {
                setValueToShow(undefined);
            }
        }

        setValues(newValues);
    }

    React.useEffect(() => {
        let ignore = false;

        async function fetchNewData() {
            var neededParamsJSON = neededParameterValues;
            var neededParamJSON = _.find(neededParamsJSON, function (o) { return o.id === updatedParam.name; });
            if (neededParamJSON) {
                neededParamJSON.value = updatedParam.value;
                let jsonValues = await fetchData(neededParamsJSON);
                if (!ignore && jsonValues && jsonValues !== '') {
                    setNewValues(jsonValues);
                }
            }
        }
        fetchNewData();
        return () => { ignore = true; }
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
                let jsonValues = await fetchData(neededParamsJSON);
                if (!ignore && jsonValues && jsonValues !== '') {
                    setNewValues(jsonValues);
                }
            }
        }

        fetchNeededParamsData();
        return () => { ignore = true; }
    }, [id]);

    async function fetchData(newNeededParameterValues) {
        setNeededParameterValues(newNeededParameterValues)
        const jsonParamaters = JSON.stringify(newNeededParameterValues).replaceAll('#', '%23');
        const response = await utils.webFetch(`getChannelDataForParam?sessionId=${globals.sessionId}&paramName=${id}&paramValues=${jsonParamaters}`);
        const responseJSON = await response.json();
        let valuesFromJSON = '';
        if (responseJSON && responseJSON !== '') {
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
        return valuesFromJSON;
    }

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
