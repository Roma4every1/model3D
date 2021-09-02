import * as React from "react";
import { useInternationalization } from '@progress/kendo-react-intl';
import { BooleanCell } from "./BooleanCell";
import { DateCell } from "./DateCell";
import { DropDownCell } from "./DropDownCell";
import { NumericCell } from "./NumericCell";
import { TextCell } from "./TextCell";
var kendo_react_data_tools_1 = require("@progress/kendo-react-data-tools");
var constants_1 = require("@progress/kendo-react-grid/dist/npm/constants");
var kendo_react_common_1 = require("@progress/kendo-react-common");
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

export const BaseCell = (props) => {


    const rowClick = (event) => {
        var a = 1 + 1;
    };

    var navigationAttributes = kendo_react_data_tools_1.useTableKeyboardNavigation(props.id);
    var _a;
    var defaultRendering = null;
    const { dataItem } = props;
    var intl = useInternationalization();
    const field = props.field || "";
    const dataValue = dataItem[field] ?? "";
    var element = '';
    if (dataItem.js_inEdit) {
        if (props.column.lookupData) {
            element = <DropDownCell {...props} dataValue={dataValue} />
        }
        else
            switch (props.editor) {
                case 'numeric':
                    element = <NumericCell {...props} dataValue={dataValue} />
                    break;
                case 'date':
                    element = <DateCell {...props} dataValue={dataValue} />
                    break;
                case 'boolean':
                    element = <BooleanCell {...props} dataValue={dataValue} />
                    break;
                default:
                    element = <TextCell {...props} dataValue={dataValue} />
                    break;
            }
    }
    else {
        element = props.format ?
            intl.format(props.format, dataValue) :
            dataValue.toString();
    }

    var className = kendo_react_common_1.classNames(props.className, { 'k-state-selected': props.isSelected });
    defaultRendering = (React.createElement("td", __assign({ colSpan: props.colSpan, style: props.style, className: className, role: 'gridcell', "aria-colindex": props.ariaColumnIndex, "aria-selected": props.isSelected }, (_a = {}, _a[constants_1.GRID_COL_INDEX_ATTRIBUTE] = props.columnIndex, _a), navigationAttributes), element));
//    defaultRendering = (React.createElement("td", (_a = {}, _a[constants_1.GRID_COL_INDEX_ATTRIBUTE] = props.columnIndex, _a), element));

    return props.render ?
        props.render.call(undefined, defaultRendering, props) :
        defaultRendering;

//    return (defaultRendering
        //<td data-grid-col-index={props.columnIndex} onClick={rowClick}>
        //    {element}
        //</td>

        //<td colSpan={props.colSpan}
        //    style={{ padding: 2, margin: 2, width: '100%' }}
        //    aria-colindex={props.ariaColumnIndex}
        //    aria-selected={props.isSelected}
        //    role='gridcell'
        //>
        //    {element}
        //</td>
  //  );
};