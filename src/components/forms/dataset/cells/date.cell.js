import * as React from "react";
import { DatePicker } from "@progress/kendo-react-dateinputs";

export const DateCell = (props) => {
    const handleChange = (e) => {
        if (props.onChange) {
            props.onChange({
                dataIndex: 0,
                dataItem: props.dataItem,
                field: props.field,
                syntheticEvent: e.syntheticEvent,
                value: e.target.value
            });
        }
    };
    return (
        <DatePicker
            onChange={handleChange}
            defaultValue={props.dataValue && typeof props.dataValue === 'object' ? props.dataValue : undefined}
        />
    );
};