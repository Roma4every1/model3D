import React from 'react';
import { Label } from "@progress/kendo-react-labels";
import { Input } from "@progress/kendo-react-inputs";

export default function StringTextEditor(props) {
    var valueToShow = props.value;
    if (!valueToShow) {
        valueToShow = ''
    }
    return (
        <div className='parametereditorbox'>
            <Label className='parameterlabel' editorId={props.id}>{props.displayName}</Label>
            <Input className='parametereditor'
                value={valueToShow}
                name={props.id}
                onChange={props.selectionChanged}
            />
        </div>
    );
}
