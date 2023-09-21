import { TFunction } from 'react-i18next';
import { useState, useEffect, cloneElement } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { Checkbox } from '@progress/kendo-react-inputs';
import { ColorPicker } from '@progress/kendo-react-inputs';
import { NumericTextBox } from '@progress/kendo-react-inputs';
import { FillNameTemplate } from './fill-name-template';
import { StyleTemplate } from './style-template';
import { applyLegend, InitPolylineState } from '../properties-utils';
import { stylesData, templatesData, paletteSettings, gradientSettings, updateImg } from '../properties-utils';
import parseColor from 'parse-color';
import './polyline-properties.scss';


interface PolylinePropertiesProps {
  element: MapPolyline;
  init: InitPolylineState;
  legends: any;
  apply: () => void;
  update: () => void;
  cancel: () => void;
  t: TFunction;
  isElementCreating: boolean;
}

export const PolylineProperties = ({element: polyline, init, legends, apply, update, cancel, t, isElementCreating}: PolylinePropertiesProps) => {
  const legendsData: any[] = legends?.sublayerSettings || [];
  const [changed, setChanged] = useState(false);

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

  const onLegendChange = (event) => {
    polyline.legend = event.value;
    setLegend(polyline.legend);
    applyLegend(polyline, event.value);
    setChanged(true); update();
  };

  const onChangeClosed = () => {
    polyline.arcs[0].closed = !polyline.arcs[0].closed;
    setClosed(polyline.arcs[0].closed);
    setChanged(true); update();
  };

  const onTransparentChange = () => {
    polyline.transparent = !polyline.transparent;
    setTransparent(polyline.transparent);
    updateImg(polyline); setChanged(true); update();
  };

  const onBorderWidthChange = (event) => {
    polyline.borderwidth = event.value;
    setBorderWidth(polyline.borderwidth);
    setChanged(true); update();
  };

  const onBorderStyleChange = (event: DropDownListChangeEvent) => {
    polyline.borderstyle = event.value.borderStyle;
    polyline.borderstyleid = event.value.style?.guid._value;
    if (typeof polyline.borderstyle === 'number') {
      polyline.borderstyleid = undefined;
      polyline.style = undefined;
    }
    setBorderStyle(polyline.borderstyle);
    setBorderStyleID(polyline.borderstyleid);
    setChanged(true); update();
  };

  const onBorderColorChange = (event) => {
    polyline.bordercolor = parseColor(event.value).hex;
    setBorderColor(polyline.bordercolor);
    setChanged(true); update();
  };

  const onFillNameChange = (event: DropDownListChangeEvent) => {
    polyline.fillname = event.value;
    setFillName(polyline.fillname);
    updateImg(polyline); setChanged(true); update();
  };

  const onFillColorChange = (event) => {
    polyline.fillcolor = parseColor(event.value).hex;
    setFillColor(polyline.fillcolor);
    updateImg(polyline); setChanged(true); update();
  };

  const onFillBackColorChange = (event) => {
    polyline.fillbkcolor = parseColor(event.value).hex;
    setFillBackColor(polyline.fillbkcolor);
    updateImg(polyline); setChanged(true); update();
  };

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
    <div className={'polyline-properties'}>
      <fieldset>
        <div className={'item'}>
          <span className={'label'}>
            {t('map.legend')}
          </span>
          <DropDownList
            style={{height: 20}}
            name={'legend'}
            data={legendsData}
            value={legend}
            itemRender={legendRender}
            textField={'name'}
            onChange={onLegendChange}
          />
        </div>
        <div className={'item'}>
          <span className={'label'}>
            {t('map.fillColor')}
          </span>
          <ColorPicker
            view={'gradient'} value={fillColor}
            paletteSettings={paletteSettings}
            gradientSettings={gradientSettings}
            onChange={onFillColorChange}
          />
        </div>
        <div className={'item'}>
          <span className={'label'}>
            {t('map.bkColor')}
          </span>
          <ColorPicker
            view={'gradient'} value={fillBackColor}
            paletteSettings={paletteSettings}
            gradientSettings={gradientSettings}
            onChange={onFillBackColorChange}
          />
        </div>
      </fieldset>
      <fieldset>
        <div className={'item'}>
          <span className={'label'}>
            {t('map.template')}
          </span>
          <DropDownList
            style={{height: 20}}
            name={'template'}
            data={templatesData}
            value={fillName}
            valueRender={templateValueRender}
            itemRender={templatesRender}
            onChange={onFillNameChange}
            disabled={!fillColor}
          />
        </div>
        <div className={'item'}>
          <span className={'label'}>
            {t('map.strokeColor')}
          </span>
          <ColorPicker
            view={'gradient'} value={borderColor}
            disabled={borderColorDisabled}
            paletteSettings={paletteSettings}
            gradientSettings={gradientSettings}
            onChange={onBorderColorChange}
          />
        </div>
        <div className={'item'}>
          <span className={'label'}>
            {t('map.strokeWidth')}
          </span>
          <NumericTextBox
            style={{height: 20}} format={'n2'}
            value={borderWidth} min={0} max={20} step={0.25}
            disabled={borderWidthDisabled} onChange={onBorderWidthChange}
          />
        </div>
      </fieldset>
      <fieldset style={{gridTemplateColumns: '1fr 1fr'}}>
        <div className={'item'}>
          <span className={'label'}>
            {t('map.style')}
          </span>
          <DropDownList
            data={stylesData} style={{height: 20}}
            value={stylesData.find(sd => sd?.key === borderStyle || sd?.key === borderStyleID)}
            valueRender={styleValueRender} itemRender={stylesRender}
            onChange={onBorderStyleChange} disabled={!borderColor}
          />
        </div>
        <div className={'item-checkbox'}>
          <Checkbox
            label={t('map.transparency')}
            checked={transparent}
            onChange={onTransparentChange}
          />
          <Checkbox
            label={t('map.closed')}
            checked={closed}
            onChange={onChangeClosed}
          />
        </div>
      </fieldset>
      <div className={'wm-dialog-actions'}>
        <Button onClick={apply} disabled={isElementCreating ? false : !changed}>
          {t('base.apply')}
        </Button>
        <Button onClick={cancel}>
          {t('base.cancel')}
        </Button>
      </div>
    </div>
  );
};
