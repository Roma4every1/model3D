import React from 'react';
import { useSelector } from 'react-redux';
import { NumericTextBox } from "@progress/kendo-react-inputs";

export default function IntegerTextEditor(props) {
    const value = useSelector((state) => state.formParams[props.formId].find((gp) => gp.id === props.id).value);

    return (
        <NumericTextBox className='parametereditor'
            value={parseInt(value)}
            name={props.id}
            onChange={props.selectionChanged}
        />
    );
}
