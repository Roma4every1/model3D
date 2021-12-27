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

    const value = useSelector((state) => state.formParams[props.formId].find((gp) => gp.id === props.id).value);

    const getValStr = (startdt, enddt) => {
        if (startdt && enddt) {
            return startdt.toLocaleDateString() + ' - ' + enddt.toLocaleDateString();
        }
        else {
            return '';
        }
    };

    //get date from str
    const get1dtVal = (dstr, posy, leny, posm, lenm, posd, lend, posh, lenh, posmi, lenmi, poss, lens) => {
        return new Date(dstr.substr(posy, leny), dstr.substr(posm, lenm) - 1, dstr.substr(posd,lend), dstr.substr(posh,lenh), dstr.substr(posmi,lenmi), dstr.substr(poss,lens));
    };

    //get date interval from interval str
    const getVal = (str) => {
        const startYnat = 0;
        const startMnat = 5;
        const startDnat = 8;
        const startYwmw = 6;
        const startMwmw = 3;
        const startDwmw = 0;
        if (str && (str.indexOf(' - ') >= 0)) {
            //init for wmw format
            let dtLength = str.indexOf(' - ');
            let secondPos = dtLength + 3;
            let startY = startYwmw;
            let startM = startMwmw;
            let startD = startDwmw;
            if (str.indexOf('T') >= 0) {
            //set for native format
                startY = startYnat;
                startM = startMnat;
                startD = startDnat;
            }
            let dt1 = get1dtVal(str.substr(0, dtLength), startY,4, startM,2, startD,2, 11,2, 14,2, 17,2);
            let dt2 = get1dtVal(str.substr(secondPos, dtLength), startY,4, startM,2, startD,2, 11,2, 14,2, 17,2);
            return {
                start: dt1,
                end: dt2
            }
        }
        else {
            return;
        }
    };

    return (
        <DateRangePicker className='parametereditorwithoutheight'
            id={props.id}
            name={props.id}
            value={getVal(value)}
            startDateInputSettings={{label: ''}}
            endDateInputSettings={{label: ''}}
            onChange={(event) => {
                var newevent = {};
                newevent.target = {};
                newevent.target.name = event.target.props.id;
                newevent.target.value = getValStr(event.target.value.start, event.target.value.end);
                props.selectionChanged(newevent)
            }}
        />
    );
}
