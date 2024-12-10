import { useEffect, useState } from 'react';
import { PropertyWindowProps, gradientSettings } from '../properties-utils';
import { signProvider } from '../../../../drawer/sign-provider';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { coordinateFormat } from '../../../../lib/constants';
import './sign-properties.scss';

import {
  NumericTextBox, NumericTextBoxChangeEvent,
  ColorPicker, ColorPickerChangeEvent,
} from '@progress/kendo-react-inputs';


export const SignProperties = (props: PropertyWindowProps<MapSign>) => {
  const { element: sign, apply, update, cancel, t, isElementCreating } = props;

  const [changed, setChanged] = useState(false);
  const onChange = () => { setChanged(true); update(); };

  const [x, setX] = useState(sign.x);
  const [y, setY] = useState(-sign.y);
  const [size, setSize] = useState(sign.size);

  const [color, setColor] = useState(sign.color);
  const [fontName, setFontName] = useState(sign.fontname);
  const [symbolCode, setSymbolCode] = useState(sign.symbolcode);

  const fontData = signProvider.getFontData(fontName);
  const validFontData = Boolean(fontData.id);
  const { minIndex, maxIndex } = fontData;

  // обновление значка при изменении минимального и максимального кода
  useEffect(() => {
    if (minIndex <= symbolCode && symbolCode <= maxIndex) return;
    setSymbolCode(minIndex); sign.symbolcode = minIndex;
    signProvider.getImage(sign.fontname, sign.symbolcode, sign.color).then(img => {
      sign.img = img; update();
    });
  }, [symbolCode, minIndex, maxIndex, sign, update]);

  /* --- Properties Handlers --- */

  const onXChange = ({value}: NumericTextBoxChangeEvent) => {
    sign.x = value; setX(value);
    onChange();
  };
  const onYChange = ({value}: NumericTextBoxChangeEvent) => {
    sign.y = -value; setY(value);
    onChange();
  };
  const onSizeChange = ({value}: NumericTextBoxChangeEvent) => {
    sign.size = value; setSize(value);
    onChange();
  };

  const onColorChange = async ({value}: ColorPickerChangeEvent) => {
    setColor(value);
    sign.color = value;
    sign.img = await signProvider.getImage(sign.fontname, sign.symbolcode, sign.color);
    onChange();
  };
  const onFontNameChange = async ({value}: DropDownListChangeEvent) => {
    setFontName(value.id);
    sign.fontname = value.id;
    sign.img = await signProvider.getImage(sign.fontname, sign.symbolcode, sign.color);
    onChange();
  };
  const onSymbolCodeChange = async ({value}: NumericTextBoxChangeEvent) => {
    setSymbolCode(value);
    sign.symbolcode = value;
    sign.img = await signProvider.getImage(sign.fontname, sign.symbolcode, sign.color);
    onChange();
  };

  return (
    <div className={'sign-properties'}>
      <div>
        <fieldset>
          <div className={'edit-field'}>
            <span>X:</span>
            <NumericTextBox value={x} onChange={onXChange} format={coordinateFormat}/>
          </div>
          <div className={'edit-field'}>
            <span>Y:</span>
            <NumericTextBox value={y} onChange={onYChange} format={coordinateFormat}/>
          </div>
          <div className={'edit-field'}>
            <span>Символ:</span>
            <NumericTextBox
              value={symbolCode} onChange={onSymbolCodeChange}
              min={minIndex} max={maxIndex} step={1}
              format={'#'} disabled={!validFontData}
            />
          </div>
        </fieldset>
        <fieldset>
          <div className={'edit-field'}>
            <span>Цвет:</span>
            <ColorPicker
              value={color} onChange={onColorChange}
              view={'gradient'} gradientSettings={gradientSettings}
            />
          </div>
          <div className={'edit-field'}>
            <span>Размер:</span>
            <NumericTextBox value={size} onChange={onSizeChange} min={0} step={0.1}/>
          </div>
          <div className={'edit-field'}>
            <span>Фонт:</span>
            <DropDownList
              data={signProvider.fontData} value={fontData} onChange={onFontNameChange}
              dataItemKey={'id'} textField={'name'} valid={validFontData}
            />
          </div>
        </fieldset>
      </div>
      <div className={'wm-dialog-actions'} style={{paddingTop: 6}}>
        <Button disabled={isElementCreating ? false : !changed} onClick={apply}>
          {t('base.apply')}
        </Button>
        <Button onClick={cancel}>
          {t('base.cancel')}
        </Button>
      </div>
    </div>
  );
};
