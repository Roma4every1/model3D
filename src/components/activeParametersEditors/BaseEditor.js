import React, { Component } from 'react';
import { IntegerTextEditor } from './IntegerTextEditor';
import { StringTextEditor } from './StringTextEditor';
import { DateTextEditor } from './DateTextEditor';

export class BaseEditor extends Component {

    render() {
        if (this.props.editorType === 'integerTextEditor') {
            return (
                <IntegerTextEditor {... this.props}  />
                );
        }
        else if (this.props.editorType === 'stringTextEditor') {
            return (
                <StringTextEditor {... this.props} />
            );
        }
        else if (this.props.editorType === 'dateTextEditor') {
            return (
                <DateTextEditor {... this.props} />
            );
        }
        else {
            return (
                <StringTextEditor {... this.props} />
            );
        }
        return <div/>
    }
}
