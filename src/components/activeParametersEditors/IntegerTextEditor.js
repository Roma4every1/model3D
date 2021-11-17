import React from 'react';
import { NumericTextBox } from "@progress/kendo-react-inputs";

export default function IntegerTextEditor(props) {
    return (
        <NumericTextBox className='parametereditor'
            value={parseInt(props.value)}
            name={props.id}
            onChange={props.selectionChanged}
        />
    );
}
