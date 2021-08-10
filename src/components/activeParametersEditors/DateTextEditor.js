import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';

export class DateTextEditor extends Component {

    render() {
        return (
            <form noValidate>
                <TextField
                    id={this.props.id}
                    variant="outlined"
                    type="date"
                    label={this.props.displayName}
                    onChange={this.props.selectionChanged}
                />
            </form>
        );
    }
}
