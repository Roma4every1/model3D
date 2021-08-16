import React from 'react';
import TextField from '@material-ui/core/TextField';

export default function IntegerTextEditor(props) {
    return (
        <form noValidate>
            <TextField
                id={props.id}
                variant="outlined"
                type="number"
                size="small"
                label={props.displayName}
                onChange={props.selectionChanged}
            />
        </form>
    );
}
