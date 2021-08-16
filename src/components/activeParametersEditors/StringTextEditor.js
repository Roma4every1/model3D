import React from 'react';
import TextField from '@material-ui/core/TextField';

export default function StringTextEditor(props) {
    var valueToShow = props.value;
    if (!valueToShow) {
        valueToShow = ''
    }
    return (
        <form noValidate>
            <TextField
                value={valueToShow}
                id={props.id}
                variant="outlined"
                size="small"
                label={props.displayName}
                onChange={props.selectionChanged}
            />
        </form>
    );
}
