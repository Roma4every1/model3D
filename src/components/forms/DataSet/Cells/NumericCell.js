import * as React from "react";
import { NumericTextBox } from "@progress/kendo-react-inputs";

export const NumericCell = (props) => {
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
        <NumericTextBox
            onChange={handleChange}
            value={typeof(props.dataValue) == "string" ? parseFloat(props.dataValue.replaceAll(',', '.')) : props.dataValue}
        />
    );
};