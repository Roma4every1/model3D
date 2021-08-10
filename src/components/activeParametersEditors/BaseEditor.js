import React, { Component } from 'react';
import { IntegerTextEditor } from './IntegerTextEditor';

export class BaseEditor extends Component {

    render() {
        if (this.props.editorType === 'integerTextEditor') {
            return (
                <IntegerTextEditor {... this.props}  />
                );
        }
        return <div/>
    }
}
