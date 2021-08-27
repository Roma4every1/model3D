import React from 'react';
import IntegerTextEditor from './IntegerTextEditor';
import StringTextEditor from './StringTextEditor';
import DateTextEditor from './DateTextEditor';
import TableRowComboEditor from './TableRowComboEditor';
import DateIntervalTextEditor from './DateIntervalTextEditor';

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
    else if (props.editorType === 'tableRowTreeMultiEditor' || props.editorType === 'tableRowComboEditor') {
        return (
            <TableRowComboEditor {...props} />
        );
    }
    else if (props.editorType === 'dateIntervalTextEditor') {
        return (
            <DateIntervalTextEditor {...props} />
        );
    }
    else {
        return (
            <StringTextEditor {...props} />
        );
    }
}
