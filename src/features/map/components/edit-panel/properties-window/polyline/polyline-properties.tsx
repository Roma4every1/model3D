import { useState, useEffect, cloneElement } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { Checkbox } from '@progress/kendo-react-inputs';
import { ColorPicker, ColorPickerChangeEvent } from '@progress/kendo-react-inputs';
import { NumericTextBox } from '@progress/kendo-react-inputs';
import { FillNameTemplate } from './fill-name-template';
import { StyleTemplate } from './style-template';
import { fillPatterns } from 'shared/drawing';
import { stylesData, paletteSettings, gradientSettings, updateImg, PropertyWindowProps } from '../properties-utils';
import './polyline-properties.scss';


export const PolylineProperties = (props: PropertyWindowProps<MapPolyline>) => {
  const { element: polyline, apply, update, cancel, t, isElementCreating } = props;
  const [changed, setChanged] = useState(false);

  /* --- Polyline Properties State --- */

  const [closed, setClosed] = useState(polyline.arcs[0]?.closed === true);
  const [transparent, setTransparent] = useState(polyline.transparent === true);

  const [borderWidth, setBorderWidth] = useState(polyline.borderwidth || 0);
  const [borderColor, setBorderColor] = useState(polyline.bordercolor || null);
  const [borderStyle, setBorderStyle] = useState(polyline.borderstyle);
  const [borderStyleID, setBorderStyleID] = useState(polyline.borderstyleid);

  const [fillName, setFillName] = useState(polyline.fillname);
  const [fillColor, setFillColor] = useState(polyline.fillcolor || null);
  const [fillBackColor, setFillBackColor] = useState(polyline.fillbkcolor || null);

  /* --- Properties Handlers --- */

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
    polyline.borderstyleid = event.value.style?.guid;
    if (typeof polyline.borderstyle === 'number') {
      polyline.borderstyleid = undefined;
      polyline.style = undefined;
    }
    setBorderStyle(polyline.borderstyle);
    setBorderStyleID(polyline.borderstyleid);
    setChanged(true); update();
  };

  const onBorderColorChange = ({value}: ColorPickerChangeEvent) => {
    polyline.bordercolor = value;
    setBorderColor(polyline.bordercolor);
    setChanged(true); update();
  };

  const onFillNameChange = (event: DropDownListChangeEvent) => {
    polyline.fillname = event.value;
    setFillName(polyline.fillname);
    updateImg(polyline); setChanged(true); update();
  };

  const onFillColorChange = ({value}: ColorPickerChangeEvent) => {
    polyline.fillcolor = value;
    setFillColor(polyline.fillcolor);
    updateImg(polyline); setChanged(true); update();
  };

  const onFillBackColorChange = ({value}: ColorPickerChangeEvent) => {
    polyline.fillbkcolor = value;
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
    if (data?.baseColor) {
      newBorderColorDisabled = true;
    }
    else if (data?.strokeDashArray) {
      if (data.strokeDashArray.color) {
        newBorderColorDisabled = true;
      }
    }
    setBorderColorDisabled(newBorderColorDisabled);
  }, [borderStyleID]);

  /* --- --- --- */

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
            {t('map.template')}
          </span>
          <DropDownList
            style={{height: 20}}
            name={'template'}
            data={fillPatterns.allPatterns}
            value={fillName}
            valueRender={templateValueRender}
            itemRender={templatesRender}
            onChange={onFillNameChange}
            disabled={!fillColor}
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
            {t('map.border-style')}
          </span>
          <DropDownList
            data={stylesData} style={{height: 20}}
            value={stylesData.find(sd => sd?.key === borderStyle || sd?.key === borderStyleID)}
            valueRender={styleValueRender} itemRender={stylesRender}
            onChange={onBorderStyleChange} disabled={!borderColor}
          />
        </div>
        <div className={'item'}>
          <span className={'label'}>
            {t('map.border-color')}
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
            {t('map.border-width')}
          </span>
          <NumericTextBox
            style={{height: 20}} format={'n2'}
            value={borderWidth} min={0} max={20} step={0.25}
            disabled={borderWidthDisabled} onChange={onBorderWidthChange}
          />
        </div>
      </fieldset>
      <fieldset style={{gridTemplateColumns: '1fr 1fr'}}>
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
