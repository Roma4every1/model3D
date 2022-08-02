import React, { useState, useEffect} from "react";
import { Label } from "@progress/kendo-react-labels";
import { IntlProvider, LocalizationProvider, loadMessages } from "@progress/kendo-react-intl";
import IntegerTextEditor from "../../../editors/IntegerTextEditor";
import ruMessages from "../../../locales/kendoUI/ru.json";


loadMessages(ruMessages, 'ru-RU');

export default function DimensionsView({subscribeOnCenterScaleChanging, updateCanvas}) {
  const [centerScale, setCenterScale] = useState({scale: 100000, centerx: 0, centery: 0});

  useEffect(() => {
    subscribeOnCenterScaleChanging(setCenterScale);
    return () => {subscribeOnCenterScaleChanging(null)};
  }, [subscribeOnCenterScaleChanging]);

  const xChanged = (event) => {
    const newCenterScale = {scale: centerScale.scale, centerx: event.value, centery: centerScale.centery};
    setCenterScale(newCenterScale);
    updateCanvas(newCenterScale);
  };

  const yChanged = (event) => {
    const newCenterScale = {scale: centerScale.scale, centerx: centerScale.centerx, centery: event.value};
    setCenterScale(newCenterScale);
    updateCanvas(newCenterScale);
  };

  const scaleChanged = (event) => {
    const newCenterScale = {scale: event.value, centerx: centerScale.centerx, centery: centerScale.centery};
    setCenterScale(newCenterScale);
    updateCanvas(newCenterScale);
  };

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        <div style={{alignItems: 'center'}}>
          <Label editorId={'xDimensionEditor'}>&nbsp;x:</Label>
          <IntegerTextEditor id={'xDimensionEditor'} value={centerScale.centerx} selectionChanged={xChanged} />
          <Label editorId={'yDimensionEditor'}>&nbsp;y:</Label>
          <IntegerTextEditor id={'yDimensionEditor'} value={centerScale.centery} selectionChanged={yChanged} />
          <Label editorId={'scaleDimensionEditor'}>&nbsp;1/</Label>
          <IntegerTextEditor id={'scaleDimensionEditor'} value={centerScale.scale} selectionChanged={scaleChanged} />
        </div>
      </IntlProvider>
    </LocalizationProvider>
  );
}
