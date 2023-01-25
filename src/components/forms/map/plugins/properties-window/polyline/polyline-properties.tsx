import { TFunction } from 'react-i18next';
import { useState, useEffect, useCallback, cloneElement } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Label } from '@progress/kendo-react-labels';
import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { Checkbox } from '@progress/kendo-react-inputs';
import { ColorPicker } from '@progress/kendo-react-inputs';
import { NumericTextBox } from '@progress/kendo-react-inputs';
import { FillNameTemplate } from './fill-name-template';
import { StyleTemplate } from './style-template';
import { applyLegend, InitPolylineState } from '../properties-utils';
import { stylesData, templatesData, paletteSettings, gradientSettings, updateImg } from '../properties-utils';
import parseColor from 'parse-color';


interface PolylinePropertiesProps {
  element: MapPolyline,
  init: InitPolylineState,
  legends: any,
  apply: () => void,
  update: () => void,
  cancel: () => void,
  t: TFunction,
}

export const PolylineProperties = ({element: polyline, init, legends, apply, update, cancel, t}: PolylinePropertiesProps) => {
  const legendsData: any[] = legends?.sublayerSettings || [];
  const [changed, setChanged] = useState(false);

  const onChange = useCallback(() => {
    setChanged(true);
    update();
  }, [update]);

  /* --- Polyline Properties State --- */

  const [legend, setLegend] = useState(init.legend);
  const [closed, setClosed] = useState(init.closed === true);
  const [transparent, setTransparent] = useState(init.transparent === true);

  const [borderWidth, setBorderWidth] = useState(init.borderWidth || 0);
  const [borderColor, setBorderColor] = useState(init.borderColor || null);
  const [borderStyle, setBorderStyle] = useState(init.borderStyle);
  const [borderStyleID, setBorderStyleID] = useState(init.borderStyleID);

  const [fillName, setFillName] = useState(init.fillName);
  const [fillColor, setFillColor] = useState(init.fillColor || null);
  const [fillBackColor, setFillBackColor] = useState(init.fillBackColor || null);

  /* --- Properties Handlers --- */

  const onLegendChange = useCallback((event) => {
    polyline.legend = event.value;
    setLegend(polyline.legend);
    // TODO set...
    applyLegend(polyline, event.value);
    onChange();
  }, [polyline, onChange]);

  const onChangeClosed = useCallback(() => {
    polyline.arcs[0].closed = !polyline.arcs[0].closed;
    setClosed(polyline.arcs[0].closed);
    onChange();
  }, [polyline, onChange]);

  const onTransparentChange = useCallback(() => {
    polyline.transparent = !polyline.transparent;
    setTransparent(polyline.transparent);
    updateImg(polyline).then(onChange);
  }, [polyline, onChange]);

  const onBorderWidthChange = useCallback((event) => {
    polyline.borderwidth = event.value;
    setBorderWidth(polyline.borderwidth);
    onChange();
  }, [polyline, onChange]);

  const onBorderStyleChange = useCallback((event: DropDownListChangeEvent) => {
    polyline.borderstyle = event.value.borderStyle;
    polyline.borderstyleid = event.value.style?.guid._value;
    if (typeof polyline.borderstyle === 'number') {
      polyline.borderstyleid = undefined;
      polyline.style = undefined;
    }
    setBorderStyle(polyline.borderstyle);
    setBorderStyleID(polyline.borderstyleid);
    onChange();
  }, [polyline, onChange]);

  const onBorderColorChange = useCallback((event) => {
    polyline.bordercolor = parseColor(event.value).hex;
    setBorderColor(polyline.bordercolor);
    onChange();
  }, [polyline, onChange]);

  const onFillNameChange = useCallback(async (event: DropDownListChangeEvent) => {
    polyline.fillname = event.value;
    setFillName(polyline.fillname);
    updateImg(polyline).then(onChange);
  }, [polyline, onChange]);

  const onFillColorChange = useCallback(async (event) => {
    polyline.fillcolor = parseColor(event.value).hex;
    setFillColor(polyline.fillcolor);
    updateImg(polyline).then(onChange);
  }, [polyline, onChange]);

  const onFillBackColorChange = useCallback(async (event) => {
    polyline.fillbkcolor = parseColor(event.value).hex;
    setFillBackColor(polyline.fillbkcolor);
    updateImg(polyline).then(onChange);
  }, [polyline, onChange]);

  /* --- --- --- */

  const [borderColorDisabled, setBorderColorDisabled] = useState(false);
  const [borderWidthDisabled, setBorderWidthDisabled] = useState(false);

  useEffect(() => {
    const data = stylesData.find(sd => sd?.key === borderStyleID)?.style;
    setBorderWidthDisabled(data?.baseThickness !== undefined);
    let newBorderColorDisabled = false;
    if (data?.baseColor?._value) {
      newBorderColorDisabled = true;
    }
    else if (data?.StrokeDashArrays) {
      if (data?.StrokeDashArrays[0].StrokeDashArray[0]?.color?._value) {
        newBorderColorDisabled = true;
      }
    }
    setBorderColorDisabled(newBorderColorDisabled);
  }, [borderStyleID]);

  /* --- --- --- */

  const legendRender = (li, itemProps) => {
    const itemChildren = (
      <span style={{fontWeight: itemProps?.dataItem.default ? 'bold' : 'normal'}}>
        {itemProps?.dataItem.name}
      </span>
    );
    return cloneElement(li, li.props, itemChildren);
  };

  const styleValueRender = (element, value) => {
    const children = [
      <div key={1}>
        <StyleTemplate
          style={value?.style}
          borderStyle={value?.borderStyle}
          borderWidth={borderWidth}
          borderColor={borderColor}
        />
      </div>
    ];
    return cloneElement(element, { ...element.props }, children);
  };

  const stylesRender = (li, itemProps) => {
    const itemChildren = (
      <StyleTemplate
        style={itemProps?.dataItem.style}
        borderStyle={itemProps?.dataItem.borderStyle}
        borderWidth={borderWidth}
        borderColor={borderColor}
      />
    );
    return cloneElement(li, li.props, itemChildren);
  };

  const templateValueRender = (element, value) => {
    const children = [
      <div key={1}>
        <FillNameTemplate
          fillName={value}
          fillColor={fillColor}
          bkColor={fillBackColor}
          transparent={transparent}
        />
      </div>
    ];
    return cloneElement(element, element.props, children);
  };

  const templatesRender = (li, itemProps) => {
    const itemChildren = (
      <FillNameTemplate
        fillName={itemProps?.dataItem}
        fillColor={fillColor}
        bkColor={fillBackColor}
        transparent={transparent}
      />
    );
    return cloneElement(li, li.props, itemChildren);
  };

  /* --- View --- */

  return (
    <div>
      <Label editorId={'legend'} className={'polylinePropertiesLegendLabel'}>
        {t('map.legend')}
      </Label>
      <DropDownList
        className={'polylinePropertiesLegendCombobox'}
        name={'legend'}
        data={legendsData}
        value={legend}
        itemRender={legendRender}
        textField={'name'}
        onChange={onLegendChange}
      />
      <Label editorId="fillColor" className='polylinePropertiesFillColorLabel'>
        {t('map.fillColor')}
      </Label>
      <div className="polylinePropertiesFillColorCombobox">
        <ColorPicker
          view={'gradient'} value={fillColor}
          paletteSettings={paletteSettings}
          gradientSettings={gradientSettings}
          onChange={onFillColorChange}
        />
      </div>
      <Label editorId="bkColor" className='polylinePropertiesBkColorLabel'>
        {t('map.bkColor')}
      </Label>
      <div className="polylinePropertiesBkColorCombobox">
        <ColorPicker
          view={'gradient'} value={fillBackColor}
          paletteSettings={paletteSettings}
          gradientSettings={gradientSettings}
          onChange={onFillBackColorChange}
        />
      </div>
      <Label editorId="template" className='polylinePropertiesTemplateLabel'>
        {t('map.template')}
      </Label>
      <DropDownList
        className={'polylinePropertiesTemplateCombobox'}
        name={'template'}
        data={templatesData}
        value={fillName}
        valueRender={templateValueRender}
        itemRender={templatesRender}
        onChange={onFillNameChange}
        disabled={!Boolean(fillColor)}
      />
      <Label editorId="strokeColor" className='polylinePropertiesStrokeColorLabel'>
        {t('map.strokeColor')}
      </Label>
      <div className="polylinePropertiesStrokeColorCombobox">
        <ColorPicker
          view={'gradient'} value={borderColor}
          disabled={borderColorDisabled}
          paletteSettings={paletteSettings}
          gradientSettings={gradientSettings}
          onChange={onBorderColorChange}
        />
      </div>
      <Label
        editorId="strokeWidth"
        className='polylinePropertiesStrokeWidthLabel'
      >
        {t('map.strokeWidth')}
      </Label>
      <NumericTextBox
        className={'polylinePropertiesStrokeWidthCombobox'}
        name={'strokeWidth'} value={borderWidth}
        min={0} max={20} step={0.25} format={'n2'}
        disabled={borderWidthDisabled} onChange={onBorderWidthChange}
      />
      <Label
        editorId="style"
        className='polylinePropertiesStyleLabel'
      >
        {t('map.style')}
      </Label>
      <DropDownList
        className={'polylinePropertiesStyleCombobox'}
        name={'style'}
        data={stylesData}
        value={stylesData.find(sd => sd?.key === borderStyle || sd?.key === borderStyleID)}
        valueRender={styleValueRender}
        itemRender={stylesRender}
        onChange={onBorderStyleChange}
        disabled={!Boolean(borderColor)}
      />
      <Checkbox
        className='polylinePropertiesTransparencyCheckbox'
        name="transparency"
        label={t('map.transparency')}
        checked={transparent}
        onChange={onTransparentChange}
      />
      <Checkbox
        className='polylinePropertiesClosedCheckbox'
        name="closed"
        label={t('map.closed')}
        checked={closed}
        onChange={onChangeClosed}
      />
      <Button className={'polylinePropertiesApplyButton'} disabled={!changed} onClick={apply}>
        {t('base.apply')}
      </Button>
      <Button className={'polylinePropertiesCancelButton'} onClick={cancel}>
        {t('base.cancel')}
      </Button>
    </div>
  );
}
