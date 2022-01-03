import React from 'react';
import { useSelector } from 'react-redux';
import { Label } from "@progress/kendo-react-labels";
import IntegerTextEditor from "../../../activeParametersEditors/IntegerTextEditor";
import {
    IntlProvider,
    LocalizationProvider,
    loadMessages,
} from "@progress/kendo-react-intl";
import ruMessages from "../../../locales/kendoUI/ru.json";
loadMessages(ruMessages, "ru-RU");

export default function Dimensions(props) {
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);

    const [centerScale, setCenterScale] = React.useState({
        scale: 100000,
        centerx: 0,
        centery: 0
    })

    React.useEffect(() => {
        formRef.current.subscribeOnCenterScaleChanging(setCenterScale);
    });

    const xChanged = (event) => {
        var newCenterScale = {
            scale: centerScale.scale,
            centerx: event.value,
            centery: centerScale.centery
        };
        setCenterScale(newCenterScale);
        formRef.current.updateCanvas(newCenterScale);
    };

    const yChanged = (event) => {
        var newCenterScale = {
            scale: centerScale.scale,
            centerx: centerScale.centerx,
            centery: event.value
        };
        setCenterScale(newCenterScale);
        formRef.current.updateCanvas(newCenterScale);
    };

    const scaleChanged = (event) => {
        var newCenterScale = {
            scale: event.value,
            centerx: centerScale.centerx,
            centery: centerScale.centery
        };
        setCenterScale(newCenterScale);
        formRef.current.updateCanvas(newCenterScale);
    };

    return (
        <LocalizationProvider language='ru-RU'>
            <IntlProvider locale='ru'>
                <div>
                <Label editorId="xDimensionEditor">x:</Label>
                <IntegerTextEditor id="xDimensionEditor" value={centerScale.centerx} selectionChanged={xChanged} />
                <Label editorId="yDimensionEditor">y:</Label>
                <IntegerTextEditor id="yDimensionEditor" value={centerScale.centery} selectionChanged={yChanged} />
                <Label editorId="scaleDimensionEditor">1/</Label>
                    <IntegerTextEditor id="scaleDimensionEditor" value={centerScale.scale} selectionChanged={scaleChanged} />
                    </div>
            </IntlProvider>
        </LocalizationProvider>
    );
}