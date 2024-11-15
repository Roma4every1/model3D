import { useState } from 'react';
import { PropertyWindowProps, updateImgPieslice } from '../properties-utils';
import { Button, Select } from 'antd';
import { ColorPicker } from 'antd';
import { InputNumber } from 'antd';
import './pieslice-properties.scss'
import type { ColorPickerProps, InputNumberProps, SelectProps} from 'antd';
import { fillPatterns } from 'shared/drawing';
import { FillNameTemplate } from './fill-name-template-pieslice';
import { inputNumberParser } from 'shared/locales';

export const PiesliceProperties = (props: PropertyWindowProps<MapPieSlice>) => {
  const { element: pieslice, apply, update, cancel, t, isElementCreating } = props;
  const [changed, setChanged] = useState(false);
  /* --- Pieslice Properties State --- */

  const [x, setX] = useState(pieslice.x);
  const [y, setY] = useState(pieslice.y);

  const [radius, setRadius] = useState(pieslice.radius);
  const [startangle, setStartangle] = useState(pieslice.startangle);
  const [endangle, setEndangle] = useState(pieslice.endangle);

  const [color, setColor] = useState(pieslice.color || null);
  const [bordercolor, setBordercolor] = useState(pieslice.bordercolor || null);

  const [transparent, setTransparent] = useState(pieslice.transparent === true);
  const [fillName, setFillName] = useState(pieslice.fillname);
  const [fillbkColor, setFillBkColor] = useState(pieslice.fillbkcolor || null);

    /* --- Проверка на то, есть ли пустые поля --- */
  function isSomethingNull(){
    let result = true;
    if (pieslice.x !== null && pieslice.y !== null) {
      if (pieslice.startangle !== null && pieslice.endangle !== null) {
        if (pieslice.radius !== null) {
           result = false;
        }
      }
    }
    return result;
  }
  
    /* --- Properties Handlers --- */
  const onBoundXChange: InputNumberProps['onChange'] = (value) => {
    if (value === null) {
      pieslice.x = null;
      setChanged(false);
      setX(pieslice.x); update();
    }
    else {
      pieslice.x = +value;
      setX(pieslice.x);
      if (isSomethingNull() === false) {
        setChanged(true);
      }
      update();
    }
  };

  const onBoundYChange: InputNumberProps['onChange'] = (value) => {
    if (value === null) {
      pieslice.y = null;
      setChanged(false);
      setY(pieslice.y); update();
    }
    else {
      pieslice.y = -value;
      setY(pieslice.y);
      if (isSomethingNull() === false) {
        setChanged(true);
      }
      update();
    }
  };

  const radiusChange: InputNumberProps['onChange'] = (value) => {
    if (value === null) {
      pieslice.radius = null;
      setChanged(false);
      setRadius(pieslice.radius); update();
    }
    else {
      pieslice.radius = +value;
      setRadius(pieslice.radius);
      if (isSomethingNull() === false) {
        setChanged(true);
      }
      update();
    }
  };

  const startangleChange: InputNumberProps['onChange'] = (value) => {
    if (value === null) {
      pieslice.startangle = null;
      setChanged(false); 
      setStartangle(pieslice.startangle); update();
    }
    else {
      pieslice.startangle = +value / 180 * Math.PI;
      setStartangle(pieslice.startangle);
      if (isSomethingNull() === false) {
        setChanged(true)
      }
      update();
    }
  };

  const endangleChange: InputNumberProps['onChange'] = (value) => {
    if (value === null) {
      pieslice.endangle = null;
      setChanged(false);
      setEndangle(pieslice.endangle); update();
    }
    else {
      pieslice.endangle = +value / 180 * Math.PI;
      setEndangle(pieslice.endangle);
      if (isSomethingNull() === false) {
        setChanged(true);
      }
      update();
    }
  };
  const onColorChange: ColorPickerProps['onChange'] = (value) => {
    pieslice.color = value.toHexString();
    setColor(pieslice.color);
    if(value === null) {
      setTransparent(true);
   }
    updateImgPieslice(pieslice);
    setChanged(true); update();
  };
  const onBorderColorChange: ColorPickerProps['onChange'] = (value) => {
    pieslice.bordercolor = value.toHexString();
    setBordercolor(pieslice.bordercolor);
    setChanged(true); update();
  };

  const onFillNameChange: SelectProps['onChange'] = (value) => {
    pieslice.fillname = value;
    setFillName(pieslice.fillname);
    updateImgPieslice(pieslice);
    setChanged(true); update();
  };

  const onFillBkColorChange: ColorPickerProps['onChange'] = (value) => {
    pieslice.fillbkcolor = value.toHexString();
    setFillBkColor(pieslice.fillbkcolor);
    updateImgPieslice(pieslice);
    setChanged(true); update();
  };
  
  const options: SelectProps['options'] = [];
  for (let i = 0; i < fillPatterns.allPatterns.length; i++) {
    const value = fillPatterns.allPatterns[i];
    options.push({
      label: <FillNameTemplate
      fillName={fillPatterns.allPatterns[i]}
      fillColor={color}
      bkColor={fillbkColor}
      transparent={transparent}/>,
      value,
    });
  }

  /* --- View --- */

  return (
    <div className={'pieslice-properties'} style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
      <fieldset style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
        <div className={'edit-field'} style={{marginLeft: '2px'}}>
          <span>X:</span>
          <InputNumber style={{width: '80px'}} value={x === null ? "" : x.toFixed(0)} onChange={onBoundXChange}/>
        </div>
        <div className={'edit-field'}>
          <span>Y:</span>
          <InputNumber style={{width: '80px'}} value={y === null ? "" : -y.toFixed(0)} onChange={onBoundYChange}/>
        </div>
        <div className={'edit-field'} style={{marginRight: '5px'}}>
          <span>Радиус:</span>
          <InputNumber value={radius === null ? "" :radius.toFixed(2)} min={0} onChange={radiusChange}
          parser={inputNumberParser}/>
        </div>
        </fieldset>
        <fieldset style={{gridTemplateColumns: '1fr 1fr', marginLeft: '14px'}}>
        <div className={'edit-field'}>
          <span>Угол от</span>
          <InputNumber style={{width: '60px'}} value={startangle === null ? "" : (startangle * 180 / Math.PI).toFixed(1)}
          onChange={startangleChange} parser={inputNumberParser}/>
          <span>до</span>
          <InputNumber style={{width: '60px'}} value={endangle === null ? "" : (endangle * 180 / Math.PI).toFixed(1)}
          onChange={endangleChange} parser={inputNumberParser}/>
        </div>
        <div className={'edit-field'}>
          <span>Цвет границы:</span>
          <ColorPicker
            value={bordercolor}
            onChange={onBorderColorChange}
          />
        </div>
      </fieldset>
        <fieldset style={{gridTemplateColumns: '1fr 1fr 1fr',  marginLeft: '13px'}}>
         <div className={'edit-field'}>
          <span className={'label'}>
            {t('map.template')}:
          </span>
          <Select
            value={fillName}
            style={{height: 24, width: 85}}
            options={options}
            onChange={onFillNameChange}
            disabled={!fillbkColor}
          />
        </div>
        <div className={'edit-field'} style={{justifyContent: 'center'}}>
        <span>Цвет:</span>
          <ColorPicker
            value={color}
            onChange={onColorChange}
          />
        </div>
        <div className={'edit-field'} style={{marginRight: '14px'}}>
          <span>Цвет заполнения:</span>
          <ColorPicker
            value={fillbkColor}
            onChange={onFillBkColorChange}
          />
        </div>
        </fieldset>
      <div className={'wm-dialog-actions'} style={{paddingTop: 6}}>
        <Button onClick={apply} disabled={ isElementCreating ? false : !changed }>
          {t('base.apply')}
        </Button>
        <Button onClick={cancel}>
          {t('base.cancel')}
        </Button>
      </div>
    </div>
  );
};
