import React from 'react';
import { Label } from "@progress/kendo-react-labels";
import { DateRangePicker } from "@progress/kendo-react-dateinputs";
import {
    IntlProvider,
    load,
    loadMessages,
    LocalizationProvider,
} from "@progress/kendo-react-intl";
import ruMessages from "./ru.json";
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
loadMessages(ruMessages, "ru-RU");


export default function DateIntervalTextEditor(props) {

    const defVal = (v, dfv, xdfv) => {
        return {v} || {dfv} || {xdfv};
    };

    const getValStr = (startdt, enddt) => {
        if ((startdt != undefined) && (enddt != undefined)) {
            return startdt.toISOString() + ' - ' + enddt.toISOString();
        }
        else {
            return '';
        }
    };


    //get date from str
    const get1dtVal = (dstr, posy, leny, posm, lenm, posd, lend, posh, lenh, posmi, lenmi, poss, lens) => {
        return new Date(dstr.substr(posy,leny), dstr.substr(posm,lenm)-1, dstr.substr(posd,lend), dstr.substr(posh,lenh), dstr.substr(posmi,lenmi), dstr.substr(poss,lens));
    };


    //get date interval from interval str
    const getVal = (str) => {
        const startYnat = 0;
        const startMnat = 5;
        const startDnat = 8;
        const startYwmw = 6;
        const startMwmw = 3;
        const startDwmw = 0;
        if ((str !=undefined) && (str.indexOf(' - ') >= 0)) {
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

    const xmin = new Date(1970, 0, 1);
    const xmax = new Date(2040, 0, 1);
    const xdefaultValue = {
        start: new Date(2021, 0, 1),
        end: new Date(2021, 11, 1)
    };
    const startDateInputSettings = {
        label: ''
    };
    const endDateInputSettings = {
        label: ''
    };

    return (
        <LocalizationProvider language='ru-RU'>
            <IntlProvider locale='ru'>
                <div className='parametereditorbox'>
                    <Label className='parameterlabel' editorId={props.id}>{props.displayName}</Label>
                    <DateRangePicker className='parametereditorwithoutheight'
                        id={props.id}
                        name={props.id}
                        min={xmin}
                        max={xmax}
                        defaultValue={defVal(getVal(props.value), getVal(props.defaultValue), xdefaultValue)}
                        value={getVal(props.value)}
                        startDateInputSettings={startDateInputSettings}
                        endDateInputSettings={endDateInputSettings}
                        onChange={(event) => {
                            var newevent = {};
                            newevent.target = {};
                            newevent.target.name = event.target.props.id;
                            newevent.target.value = getValStr(event.target.value.start, event.target.value.end);
                            props.selectionChanged(newevent)
                        }}
                    />
                </div>
            </IntlProvider>
        </LocalizationProvider>
    );
}
