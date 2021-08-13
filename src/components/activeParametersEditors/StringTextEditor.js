import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';

export class StringTextEditor extends Component {

    render() {
        var valueToShow = this.props.value;
        if (!valueToShow) {
            valueToShow = ''
        }
        return (
            <form noValidate>
                <TextField
                    value={valueToShow}
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
