import React from 'react';
import IntegerTextEditor from './IntegerTextEditor';
import StringTextEditor from './StringTextEditor';
import DateTextEditor from './DateTextEditor';
import TableRowComboEditor from './TableRowComboEditor';
import DateIntervalTextEditor from './DateIntervalTextEditor';
import BoolTextEditor from './BoolTextEditor';

export default function BaseEditor(props) {
    switch (props.editorType) {
        case 'integerTextEditor':
            return <IntegerTextEditor {...props} />;
        case 'stringTextEditor':
            return <StringTextEditor {...props} />;
        case 'dateTextEditor':
        case 'dateKMNEditor':
            return <DateTextEditor {...props} />;
        case 'tableRowTreeMultiEditor':
        case 'tableRowComboEditor':
            return <TableRowComboEditor {...props} />;
        case 'dateIntervalTextEditor':
            return <DateIntervalTextEditor {...props} />;
        case 'boolTextEditor':
            return <BoolTextEditor {...props} />;
        default:
            return <StringTextEditor {...props} />;
    }
}
