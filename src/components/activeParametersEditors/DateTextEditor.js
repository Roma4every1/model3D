import React from 'react';
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
    load,
} from "@progress/kendo-react-intl";
import likelySubtags from "cldr-core/supplemental/likelySubtags.json";
import currencyData from "cldr-core/supplemental/currencyData.json";
import weekData from "cldr-core/supplemental/weekData.json";
import numbers from "cldr-numbers-full/main/ru/numbers.json";
import caGregorian from "cldr-dates-full/main/ru/ca-gregorian.json";
import dateFields from "cldr-dates-full/main/ru/dateFields.json";
import timeZoneNames from "cldr-dates-full/main/ru/timeZoneNames.json";
load(
    likelySubtags,
    currencyData,
    weekData,
    numbers,
    caGregorian,
    dateFields,
    timeZoneNames
);

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
