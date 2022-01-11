import React from 'react';
import { useSelector } from 'react-redux';
import { DateRangePicker } from "@progress/kendo-react-dateinputs";
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


export default function DateIntervalTextEditor(props) {

    const getDefaultValue = (string) => {
        try {
            var index = string.indexOf(' - ');
            if (index > 0) {
                let startDateString = string.slice(0, index);
                let finishDateString = string.slice(index + 3);
                return {
                    start: new Date(startDateString.replace(' \\d', '')),
                    end: new Date(finishDateString.replace(' \\d', ''))
                }
            }
            else {
                return undefined;
            }
        }
        catch {
            return undefined;
        }
    }

    const date = getDefaultValue(props.value);
    const [value, setValue] = React.useState(date);

    const getValStr = (value) => {
        if (value.start && value.end) {
            return value.start.toLocaleDateString() + ' - ' + value.end.toLocaleDateString();
        }
        else {
            return '';
        }
    };

    const changeValue = (localvalue) => {
        var newevent = {};
        newevent.target = {};
        newevent.target.name = props.id;
        newevent.target.value = getValStr(localvalue ?? value);
        props.selectionChanged(newevent);
    }

    const handleChange = (event) => {
        setValue(event.value);
        if (event.syntheticEvent.type === 'click') {
            changeValue(event.target.value);
        }
    };

    return (
        <DateRangePicker className='parametereditorwithoutheight'
            id={props.id}
            name={props.id}
            value={value}
            startDateInputSettings={{label: ''}}
            endDateInputSettings={{label: ''}}
            onChange={handleChange}
            onBlur={() => changeValue()}
        />
    );
}
