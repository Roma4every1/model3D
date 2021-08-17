import React from 'react';
import { NumericTextBox } from "@progress/kendo-react-inputs";

export default function IntegerTextEditor(props) {
    return (
        <form noValidate>
            <NumericTextBox
                name={props.id}
                label={props.displayName}
                onChange={props.selectionChanged}
            />
        </form>
    );
}
