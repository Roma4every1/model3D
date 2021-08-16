import React from 'react';
import IntegerTextEditor from './IntegerTextEditor';
import StringTextEditor from './StringTextEditor';
import DateTextEditor from './DateTextEditor';

export default function BaseEditor(props) {
    if (props.editorType === 'integerTextEditor') {
        return (
            <IntegerTextEditor {...props} />
        );
    }
    else if (props.editorType === 'stringTextEditor') {
        return (
            <StringTextEditor {...props} />
        );
    }
    else if (props.editorType === 'dateTextEditor') {
        return (
            <DateTextEditor {...props} />
        );
    }
    else {
        return (
            <StringTextEditor {...props} />
        );
    }
}
