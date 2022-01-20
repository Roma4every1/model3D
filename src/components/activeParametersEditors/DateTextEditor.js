import React from 'react';
import { DatePicker } from "@progress/kendo-react-dateinputs";

export default function DateTextEditor(props) {
    const date = props.value ? ((props.value instanceof Date) ? props.value : new Date(props.value.replace(' \\d', ''))) : undefined;
    const [value, setValue] = React.useState(date);

    const handleChange = (event) => {
        setValue(event.value);
        if (event.syntheticEvent.type === 'click') {
            changeValue(event.value);
        }
    };

    const changeValue = (localvalue) => {
        var newevent = {};
        newevent.target = {};
        newevent.target.name = props.id;
        newevent.target.value = localvalue ?? value;
        props.selectionChanged(newevent);
    }

    return (
        <DatePicker className='parametereditor'
            id={props.id}
            name={props.id}
            defaultValue={date}
            onChange={handleChange}
            onBlur={() => changeValue()}
        />
    );
}
