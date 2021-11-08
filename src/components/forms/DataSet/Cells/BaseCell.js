import * as React from 'react';
import { BooleanCell } from "./BooleanCell";
import { DateCell } from "./DateCell";
import { DropDownCell } from "./DropDownCell";
import { NumericCell } from "./NumericCell";
import { TextCell } from "./TextCell";
import { useInternationalization } from '@progress/kendo-react-intl';
import { useTableKeyboardNavigation } from '@progress/kendo-react-data-tools';

export var BaseCell = function (props) {
    var intl = useInternationalization();
    var data = props.dataItem[props.field] ?? '';
    var navigationAttributes = useTableKeyboardNavigation(props.id);
    var element = '';
    if (props.dataItem.js_inEdit && props.editField === props.field) {
        switch (props.type) {
            case 'lookup':
                element = <DropDownCell {...props} lookupData={props.values} dataValue={data} />;
                break;
            case 'numeric':
                element = <NumericCell {...props} dataValue={data} />;
                break;
            case 'date':
                element = <DateCell {...props} dataValue={data} />;
                break;
            case 'boolean':
                element = <BooleanCell {...props} dataValue={data} />;
                break;
            default:
                element = <TextCell {...props} dataValue={data} />;
                break;
        }
    }
    else {
        if (data !== undefined && data !== null) {
            element = props.format ?
                intl.format(props.format, data) :
                data.toString();
        }
    }
    return <td data-grid-col-index={props.columnIndex}
        style={{ padding: 1, width: '100%' }}
        aria-colindex={props.ariaColumnIndex}
        aria-selected={props.isSelected}
        onDoubleClick={props.onDoubleClick}
        {...navigationAttributes}
        role='gridcell'
    >
        {element}
    </td>
};
