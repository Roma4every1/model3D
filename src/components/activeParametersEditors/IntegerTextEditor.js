import React from 'react';
import { useSelector } from 'react-redux';
import { NumericTextBox } from "@progress/kendo-react-inputs";

export default function IntegerTextEditor(props) {
    const value = useSelector((state) => props.formId ? state.formParams[props.formId].find((gp) => gp.id === props.id).value : props.value);

    return (
        <NumericTextBox className='parametereditor'
            value={parseFloat(value)}
            name={props.id}
            onChange={props.selectionChanged}
        />
    );
}
