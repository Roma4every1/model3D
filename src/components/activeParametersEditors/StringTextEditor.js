import React from 'react';
import { Input } from "@progress/kendo-react-inputs";

export default function StringTextEditor(props) {
    var valueToShow = props.value;
    if (!valueToShow) {
        valueToShow = ''
    }
    return (
        <form noValidate>
            <Input
                style={{
                    width: "100%",
                }}
                value={valueToShow}
                name={props.id}
                label={props.displayName}
                onChange={props.selectionChanged}
            />
        </form>
    );
}
