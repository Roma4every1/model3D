import { useEffect, useState } from 'react';
import { TFunction } from 'react-i18next';
import { InitSignState, gradientSettings } from '../properties-utils.ts';
import { provider } from '../../../../drawer';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import './sign-properties.scss';

import {
  NumericTextBox, NumericTextBoxChangeEvent,
  ColorPicker, ColorPickerChangeEvent,
} from '@progress/kendo-react-inputs';


interface SignPropertiesProps {
  element: MapSign;
  init: InitSignState;
  apply: () => void;
  update: () => void;
  cancel: () => void;
  t: TFunction;
  isElementCreating: boolean;
}


export const SignProperties = (props: SignPropertiesProps) => {
  const { element: sign, init, apply, update, cancel, t, isElementCreating } = props;

  const [changed, setChanged] = useState(false);
  const onChange = () => { setChanged(true); update(); };

  const [x, setX] = useState(init.x);
  const [y, setY] = useState(-init.y);
  const [size, setSize] = useState(init.size);

  const [color, setColor] = useState(init.color);
  const [fontName, setFontName] = useState(init.fontName);
  const [symbolCode, setSymbolCode] = useState(init.symbolCode);

  const fontData = provider.getSignFontData(fontName);
  const validFontData = Boolean(fontData.id);
  const { minIndex, maxIndex } = fontData;

  // обновление значка при изменении минимального и максимального кода
  useEffect(() => {
    if (minIndex <= symbolCode && symbolCode <= maxIndex) return;
    setSymbolCode(minIndex); sign.symbolcode = minIndex;
    provider.getSignImage(sign.fontname, sign.symbolcode, sign.color).then(img => {
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
    sign.img = await provider.getSignImage(sign.fontname, sign.symbolcode, sign.color);
    onChange();
  };
  const onFontNameChange = async ({value}: DropDownListChangeEvent) => {
    setFontName(value.id);
    sign.fontname = value.id;
    sign.img = await provider.getSignImage(sign.fontname, sign.symbolcode, sign.color);
    onChange();
  };
  const onSymbolCodeChange = async ({value}: NumericTextBoxChangeEvent) => {
    setSymbolCode(value);
    sign.symbolcode = value;
    sign.img = await provider.getSignImage(sign.fontname, sign.symbolcode, sign.color);
    onChange();
  };

  return (
    <div className={'sign-properties'}>
      <div>
        <fieldset>
          <div className={'edit-field'}>
            <span>X:</span>
            <NumericTextBox value={x} onChange={onXChange}/>
          </div>
          <div className={'edit-field'}>
            <span>Y:</span>
            <NumericTextBox value={y} onChange={onYChange}/>
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
            <NumericTextBox value={size} onChange={onSizeChange} step={0.1}/>
          </div>
          <div className={'edit-field'}>
            <span>Фонт:</span>
            <DropDownList
              data={provider.fontData} value={fontData} onChange={onFontNameChange}
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
