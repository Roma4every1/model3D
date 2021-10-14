import React from 'react';
import { Label } from "@progress/kendo-react-labels";
import { NumericTextBox } from "@progress/kendo-react-inputs";

export default function IntegerTextEditor(props) {
    return (
        <div className='parametereditorbox'>
            <Label className='parameterlabel' editorId={props.id}>{props.displayName}</Label>
            <NumericTextBox className='parametereditor'
                value={props.value ?? ''}
                name={props.id}
                onChange={props.selectionChanged}
            />
        </div>
    );
}
