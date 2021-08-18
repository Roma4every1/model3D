import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { globals } from '../Globals';
var _ = require("lodash");
var utils = require("../../utils")

export default function TableRowComboEditor(props) {
    const { id, displayName, value, selectionChanged, updatedParam } = props;
    const [values, setValues] = React.useState([]);
    const [neededParameterValues, setNeededParameterValues] = React.useState([]);

    React.useEffect(() => {
        let ignore = false;

        async function fetchNewData() {
            var neededParamsJSON = neededParameterValues;
            var neededParamJSON = _.find(neededParamsJSON, function (o) { return o.id === updatedParam.name; });
            if (neededParamJSON) {
                neededParamJSON.value = updatedParam.value;
                let jsonValues = await fetchData(neededParamsJSON);
                if (!ignore && jsonValues && jsonValues !== '') {
                    setValues(jsonValues);
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
                    setValues(jsonValues);
                }
            }
        }

        fetchNeededParamsData();
        return () => { ignore = true; }
    }, [id]);

    async function fetchData(newNeededParameterValues) {
        setNeededParameterValues(newNeededParameterValues)
        const jsonParamaters = JSON.stringify(newNeededParameterValues);
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
                temp.id = 'LOOKUPCODE%23' + row.Cells[idIndex] + '%23' + responseJSON.data.Columns[idIndex].NetType;
                temp.name = row.Cells[nameIndex];
                return temp
            });
        }
        return valuesFromJSON;
    }
    return (
        <FormControl variant="outlined" style={{ width: "100%" }}>
            <InputLabel id="demo-simple-select-outlined-label">{displayName}</InputLabel>
            <Select onChange={selectionChanged} name={id} style={{ width: "100%" }}>
                {values.map((valueJSON) =>
                    <MenuItem key={valueJSON.id} value={valueJSON.id}>{valueJSON.name}</MenuItem>
                )}
            </Select>
        </FormControl>
    );
}
