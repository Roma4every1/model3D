import React from 'react';
import TextField from '@material-ui/core/TextField';

export default function DateTextEditor(props) {
    return (
        <form noValidate>
            <TextField
                id={props.id}
                variant="outlined"
                type="date"
                size="small"
                label={props.displayName}
                onChange={props.selectionChanged}
            />
        </form>
    );
}
