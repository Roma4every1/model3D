
import React from 'react';
import { Label } from "@progress/kendo-react-labels";
import IntegerTextEditor from "../../../activeParametersEditors/IntegerTextEditor";
import {
    IntlProvider,
    LocalizationProvider,
    loadMessages,
} from "@progress/kendo-react-intl";
import ruMessages from "../../../locales/kendoUI/ru.json";
loadMessages(ruMessages, "ru-RU");

export default function DimensionsView(props) {
    const { subscribeOnCenterScaleChanging, updateCanvas } = props;

    const [centerScale, setCenterScale] = React.useState({
        scale: 100000,
        centerx: 0,
        centery: 0
    })

    React.useEffect(() => {
        subscribeOnCenterScaleChanging(setCenterScale);
        return () => {
            subscribeOnCenterScaleChanging(null);
        }
    }, [subscribeOnCenterScaleChanging]);

    const xChanged = (event) => {
        var newCenterScale = {
            scale: centerScale.scale,
            centerx: event.value,
            centery: centerScale.centery
        };
        setCenterScale(newCenterScale);
        updateCanvas(newCenterScale);
    };

    const yChanged = (event) => {
        var newCenterScale = {
            scale: centerScale.scale,
            centerx: centerScale.centerx,
            centery: event.value
        };
        setCenterScale(newCenterScale);
        updateCanvas(newCenterScale);
    };

    const scaleChanged = (event) => {
        var newCenterScale = {
            scale: event.value,
            centerx: centerScale.centerx,
            centery: centerScale.centery
        };
        setCenterScale(newCenterScale);
        updateCanvas(newCenterScale);
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