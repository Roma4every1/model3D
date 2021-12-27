import React from 'react';
import { useSelector } from 'react-redux';
import { Checkbox } from "@progress/kendo-react-inputs";

export default function BoolTextEditor(props) {

    const value = useSelector((state) => state.formParams[props.formId].find((gp) => gp.id === props.id).value);

    return (
        <Checkbox className='parametereditorwithoutheightcb'
            id={props.id}
            name={props.id}
            value={value}
            onChange={(event) => {
                var newevent = {};
                newevent.target = {};
                newevent.target.name = event.target.name;
                newevent.target.value = event.target.value;
                props.selectionChanged(newevent)
            }}
        />
    );
}
