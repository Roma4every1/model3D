import * as React from "react";
import { DropDownList } from "@progress/kendo-react-dropdowns";

export const DropDownCell = (props) => {
    const handleChange = (e) => {
        if (props.onChange) {
            dataItem[props.field + '_jsoriginal'] = e.target.value.id;
            props.onChange({
                dataIndex: 0,
                dataItem: props.dataItem,
                field: props.field,
                syntheticEvent: e.syntheticEvent,
                value: e.target.value.value
            });
        }
    };

    const { dataItem, column } = props;
    const field = props.field || "";
    const dataValue = dataItem[field] === null ? "" : dataItem[field];
    return (
        <td>
            {dataItem.js_inEdit ? (
                <DropDownList
                    onChange={handleChange}
                    value={column.lookupData.find((c) => c.value === dataValue)}
                    data={column.lookupData}
                    textField="text"
                />
            ) :
                dataValue
            }
        </td>
    );
};