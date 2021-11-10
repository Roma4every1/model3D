import React from 'react';
import { useSelector } from 'react-redux';
import { Label } from "@progress/kendo-react-labels";
import {
    IntlProvider,
    LocalizationProvider,
    loadMessages,
} from "@progress/kendo-react-intl";
import ruMessages from "../locales/kendoUI/ru.json";
loadMessages(ruMessages, "ru");
var utils = require("../../utils");

export default function StringTextEditor(props) {
    const sessionId = useSelector((state) => state.sessionId);

    const onBeforeUpload = (event) => {
        const file = event.target.files[0];
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async function () {
            const response = await utils.webFetch(`uploadFile?sessionId=${sessionId}&filename=${file.name}`,
                {
                    method: 'POST',
                    body: reader.result
                });
            const data = await response.text();
            var newevent = {};
            newevent.target = {};
            newevent.target.name = props.id;
            newevent.target.value = data;
            props.selectionChanged(newevent);
        }
    };

    return (
        <LocalizationProvider language="ru-RU">
            <IntlProvider locale="ru">
                <div className='parametereditorbox'>
                    <Label className='parameterlabel' editorId={props.id}>{props.displayName}</Label>
                    <input className='parametereditor' type="file" onChange={onBeforeUpload} />
                </div>
            </IntlProvider>
        </LocalizationProvider>
    );
}
