import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { globals } from '../Globals';
var utils = require("../../utils")

export default function TabelRowComboEditor(props) {
    const { id, displayName, value, selectionChanged } = props;
    const [values, setValues] = React.useState([]);

    React.useEffect(() => {
        let ignore = false;

        async function fetchData() {
            const response = await utils.webFetch(`getChannelDataForParam?sessionId=${globals.sessionId}&paramName=${id}`);
            const responseJSON = await response.json();
            const valuesFromJSON = responseJSON.Rows.map((row) => row.Cells[0]);
            if (!ignore) {
                setValues(valuesFromJSON);
            }
        }
        fetchData();
        return () => { ignore = true; }
    }, [id]);

    return (
        <FormControl variant="outlined" name={id}>
            <InputLabel id="demo-simple-select-outlined-label">{displayName}</InputLabel>
            <Select selectionChanged={selectionChanged}>
                {values.map((valueJSON) =>
                    <MenuItem value={valueJSON}>{valueJSON}</MenuItem>
                )}
            </Select>
        </FormControl>
    );
}
