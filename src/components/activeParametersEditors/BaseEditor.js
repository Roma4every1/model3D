import React from 'react';
import { useSelector } from 'react-redux';
import IntegerTextEditor from './IntegerTextEditor';
import StringTextEditor from './StringTextEditor';
import DateTextEditor from './DateTextEditor';
import TableRowComboEditor from './TableRowComboEditor';
import DateIntervalTextEditor from './DateIntervalTextEditor';
import BoolTextEditor from './BoolTextEditor';

export default function BaseEditor(props) {
    const value = useSelector((state) => state.formParams[props.formId].find((gp) => gp.id === props.id).value);
    switch (props.editorType) {
        case 'integerTextEditor':
            return <IntegerTextEditor value={value} {...props} />;
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
        default:
            return <StringTextEditor value={value} {...props} />;
    }
}
