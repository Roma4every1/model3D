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

    const { dataItem, lookupData } = props;
    const field = props.field || "";
    const dataValue = dataItem[field] === null ? "" : dataItem[field];
    return (
        <DropDownList
            onChange={handleChange}
            value={lookupData.find((c) => c.value === dataValue)}
            data={lookupData}
            textField="text"
        />
    );
};