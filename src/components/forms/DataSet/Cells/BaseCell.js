import * as React from 'react';
import { BooleanCell } from "./BooleanCell";
import { ButtonCell } from "./ButtonCell";
import { DateCell } from "./DateCell";
import { DropDownCell } from "./DropDownCell";
import { NumericCell } from "./NumericCell";
import { TextCell } from "./TextCell";
import { useInternationalization } from '@progress/kendo-react-intl';

export var BaseCell = function (props) {
    var data = props.dataItem[props.field] ?? '';
    var intl = useInternationalization();
    var element = '';
    var stringData = '';
    if (data !== undefined && data !== null) {
        stringData = props.format ?
            intl.format(props.format, data) :
            data.toString();
    }

    if (props.type === 'secondLevel') {
        element = <ButtonCell {...props} data={stringData} secondLevelFormId={props.secondLevelFormId} channelName={props.channelName} />;
    }
    else if (props.dataItem.js_inEdit && props.editField === props.field) {
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
        element = stringData;
    }
    return element;
};
