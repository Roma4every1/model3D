import React from 'react';
import { useSelector } from 'react-redux';
import BoolTextEditor from './BoolTextEditor';
import DateTextEditor from './DateTextEditor';
import DateIntervalTextEditor from './DateIntervalTextEditor';
import FileTextEditor from './FileTextEditor';
import IntegerTextEditor from './IntegerTextEditor';
import StringComboEditor from './StringComboEditor';
import StringTextEditor from './StringTextEditor';
import TableRowComboEditor from './TableRowComboEditor';

export default function BaseEditor(props) {
    const value = useSelector((state) => state.formParams[props.formId].find((gp) => gp.id === props.id).value);
    switch (props.editorType) {
        case 'integerTextEditor':
            return <IntegerTextEditor value={value} {...props} />;
        case 'stringComboEditor':
            return <StringComboEditor value={value} {...props} />;
        case 'stringTextEditor':
            return <StringTextEditor value={value} {...props} />;
        case 'dateTextEditor':
        case 'dateKMNEditor':
            return <DateTextEditor value={value} {...props} />;
        case 'tableRowTreeMultiEditor':
        case 'tableRowComboEditor':
            return <TableRowComboEditor value={value}  {...props} />;
        case 'dateIntervalTextEditor':
            return <DateIntervalTextEditor value={value} {...props} />;
        case 'boolTextEditor':
            return <BoolTextEditor value={value} {...props} />;
        case 'fileTextEditor':
            return <FileTextEditor value={value} {...props} />;
        default:
            return <StringTextEditor value={value} {...props} />;
    }
}
