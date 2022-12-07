import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BooleanCell } from "./boolean.cell";
import { DateCell } from "./date.cell";
import { DropDownCell } from "./drop-down.cell";
import { NumericCell } from "./numeric.cell";
import { TextCell } from "./text.cell";
import { useInternationalization } from '@progress/kendo-react-intl';

export var BaseCell = function (props) {
    const { t } = useTranslation();
    var data = props.dataItem[props.field] ?? '';
    var intl = useInternationalization();
    var element = '';
    var stringData = '';
    if (data !== undefined && data !== null) {
        stringData = props.format ?
            intl.format(props.format, data) :
            data.toString();
    }

    const openNestedForm = async () => {
        props.setOpened(true);
    };

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
        element = stringData;
    }
    if ((!(props.dataItem.js_inEdit && props.editField === props.field)) && props.setOpened) {
        return (
            <div>
                {element}
                <div className="buttonCell">
                    <span className="k-icon k-i-window font-10" alt={t('table.showDetailInfo')} title={t('table.showDetailInfo')} onClick={openNestedForm} />
                </div>
            </div>);
    }
    else {
        return element;
    }
};
