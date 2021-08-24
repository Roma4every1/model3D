import React from 'react';
import { Label } from "@progress/kendo-react-labels";
import { DatePicker } from "@progress/kendo-react-dateinputs";
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

export default function DateTextEditor(props) {
    const date = new Date(props.value);

    return (
        <LocalizationProvider language='ru-RU'>
            <IntlProvider locale='ru'>
                <div className='parametereditorbox'>
                    <Label className='parameterlabel' editorId={props.id}>{props.displayName}</Label>
                    <DatePicker className='parametereditor'
                        id={props.id}
                        name={props.id}
                        defaultValue={date}
                        onChange={(event) => {
                            var newevent = {};
                            newevent.target = {};
                            newevent.target.name = event.target.name;
                            newevent.target.value = event.target.value.toISOString();
                            props.selectionChanged(newevent)
                        }}
                    />
                </div>
            </IntlProvider>
        </LocalizationProvider>
    );
}
