import * as React from "react";
import { Input } from "@progress/kendo-react-inputs";

export const BooleanCell = (props) => {
    const handleChange = (e) => {
        if (props.onChange) {
            props.onChange({
                dataIndex: 0,
                dataItem: props.dataItem,
                field: props.field,
                syntheticEvent: e.syntheticEvent,
                value: e.target.value.value
            });
        }
    };
    return (
        <Input
            onChange={handleChange}
            value={props.dataValue === 'true'}
        />
    );
};