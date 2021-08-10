import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';

export class StringTextEditor extends Component {

    render() {
        return (
            <form noValidate>
                <TextField
                    id={this.props.id}
                    variant="outlined"
                    size="small"
                    label={this.props.displayName}
                    onChange={this.props.selectionChanged}
                />
            </form>
        );
    }
}
