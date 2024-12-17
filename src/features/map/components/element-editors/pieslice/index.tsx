import { type PropertyWindowProps, updateImgPieSlice } from '../properties-utils';
import { useState } from 'react';
import { round } from 'shared/lib';
import { inputNumberParser, inputIntParser } from 'shared/locales';
import { fillPatterns } from 'shared/drawing';

import './pieslice-editor.scss';
import { Button, InputNumber, Select, Checkbox, ColorPicker } from 'antd';
import { FillNameTemplate } from './fill-name-template-pieslice';


export const PieSlicePropertyEditor = (props: PropertyWindowProps<MapPieSlice>) => {
  const [changed, setChanged] = useState(0);
  const { element: pie, apply, update, cancel, t, isElementCreating } = props;

  const onXChange = (value: number | null) => {
    if (value === null) return;
    pie.x = value;
    setChanged(changed + 1); update();
  };
  const onYChange = (value: number | null) => {
    if (value === null) return;
    pie.y = -value;
    setChanged(changed + 1); update();
  };
  const onRadiusChange = (value: number | null) => {
    if (value === null) return;
    pie.radius = round(value, 2);
    setChanged(changed + 1); update();
  };

  const onStartAngleChange = (value: number | null) => {
    if (value === null) return;
    pie.startangle = value / 180 * Math.PI;
    setChanged(changed + 1); update();
  };
  const onEndAngleChange = (value: number | null) => {
    if (value === null) return;
    pie.endangle = value / 180 * Math.PI;
    setChanged(changed + 1); update();
  };

  const onFillNameChange = (value: string) => {
    pie.fillname = value;
    updateImgPieSlice(pie);
    setChanged(changed + 1); update();
  };
  const onTransparentChange = () => {
    pie.transparent = !pie.transparent;
    updateImgPieSlice(pie);
    setChanged(changed + 1); update();
  };

  const onColorChange = (_: any, hex: string) => {
    pie.color = hex;
    updateImgPieSlice(pie);
    setChanged(changed + 1); update();
  };
  const onBorderColorChange = (_: any, hex: string) => {
    pie.bordercolor = hex;
    setChanged(changed + 1); update();
  };
  const onFillBkColorChange = (_: any, hex: string) => {
    pie.fillbkcolor = hex;
    updateImgPieSlice(pie);
    setChanged(changed + 1); update();
  };

  const options = fillPatterns.allPatterns.map((name: string) => {
    const label = (
      <FillNameTemplate
        fillName={name} fillColor={pie.color}
        bkColor={pie.fillbkcolor} transparent={pie.transparent}
      />
    );
    return {label: label, value: name};
  });

  const startAngleDeg = round(pie.startangle * 180 / Math.PI, 1);
  const endAngleDeg = round(pie.endangle * 180 / Math.PI, 1);

  return (
    <div className={'pieslice-properties'}>
      <fieldset>
        <span>X:</span>
        <InputNumber
          style={{width: 70}} value={pie.x} onChange={onXChange}
          parser={inputIntParser} controls={false} changeOnWheel={true}
        />
        <span>Y:</span>
        <InputNumber
          style={{width: 70}} value={-pie.y} onChange={onYChange}
          parser={inputIntParser} controls={false} changeOnWheel={true}
        />
        <span style={{marginLeft: 15}}>Радиус:</span>
        <InputNumber
          style={{width: 70}} value={pie.radius} min={0} onChange={onRadiusChange}
          parser={inputNumberParser} controls={false} changeOnWheel={true}
        />
      </fieldset>
      <fieldset>
        <span>Угол от</span>
        <InputNumber
          style={{width: 50}}
          value={startAngleDeg} min={0} max={endAngleDeg} onChange={onStartAngleChange}
          parser={inputNumberParser} controls={false} changeOnWheel={true}
        />
        <span>до</span>
        <InputNumber
          style={{width: 50}}
          value={endAngleDeg} min={startAngleDeg} max={360} onChange={onEndAngleChange}
          parser={inputNumberParser} controls={false} changeOnWheel={true}
        />
        <span style={{marginLeft: 14}}>Цвет:</span>
        <ColorPicker value={pie.color} onChange={onColorChange} disabledAlpha={true}/>
        <span>Граница:</span>
        <ColorPicker
          value={pie.bordercolor} onChange={onBorderColorChange}
          disabledAlpha={true} allowClear={false}
        />
      </fieldset>
      <fieldset>
        <span className={'label'}>{t('map.template')}:</span>
        <Select
          style={{width: 88}} options={options} value={pie.fillname}
          onChange={onFillNameChange}
        />
        <ColorPicker value={pie.fillbkcolor} onChange={onFillBkColorChange} disabledAlpha={true}/>
        <Checkbox style={{marginLeft: 16}} checked={pie.transparent} onChange={onTransparentChange}>
          {t('map.transparency')}
        </Checkbox>
      </fieldset>
      <div className={'wm-dialog-actions'} style={{paddingTop: 8}}>
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
