import type { PropertyWindowProps } from '../properties-utils';
import type { NumberFormatOptions } from '@progress/kendo-react-intl';
import type { DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import type { NumericTextBoxChangeEvent, ColorPickerChangeEvent } from '@progress/kendo-react-inputs';
import { useEffect, useState } from 'react';
import { signProvider } from '../../../drawer/sign-provider';
import { gradientSettings } from '../properties-utils';

import './sign-editor.scss';
import { Button } from 'antd';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { NumericTextBox, ColorPicker } from '@progress/kendo-react-inputs';


const coordinateFormat: NumberFormatOptions = {
  style: 'decimal',
  useGrouping: false,
  maximumFractionDigits: 0,
};

export const SignPropertyEditor = (props: PropertyWindowProps<MapSign>) => {
  const [changed, setChanged] = useState(0);
  const { element: sign, apply, update, cancel, t, isElementCreating } = props;
  const { x, y, size, symbolcode, fontname } = sign;

  const fontData = signProvider.getFontData(fontname);
  const validFontData = Boolean(fontData.id);
  const { minIndex, maxIndex } = fontData;

  // обновление значка при изменении минимального и максимального кода
  useEffect(() => {
    if (minIndex <= symbolcode && symbolcode <= maxIndex) return;
    sign.symbolcode = minIndex;

    signProvider.getImage(sign.fontname, sign.symbolcode, sign.color).then(img => {
      sign.img = img; update();
    });
    setChanged(x => x + 1);
  }, [symbolcode, minIndex, maxIndex, sign, update]);

  /* --- Properties Handlers --- */

  const onXChange = ({value}: NumericTextBoxChangeEvent) => {
    sign.x = value;
    setChanged(changed + 1); update();
  };
  const onYChange = ({value}: NumericTextBoxChangeEvent) => {
    sign.y = -value;
    setChanged(changed + 1); update();
  };
  const onSizeChange = ({value}: NumericTextBoxChangeEvent) => {
    sign.size = value;
    setChanged(changed + 1); update();
  };

  const onColorChange = async ({value}: ColorPickerChangeEvent) => {
    sign.color = value;
    sign.img = await signProvider.getImage(sign.fontname, sign.symbolcode, sign.color);
    setChanged(changed + 1); update();
  };
  const onFontNameChange = async ({value}: DropDownListChangeEvent) => {
    sign.fontname = value.id;
    sign.img = await signProvider.getImage(sign.fontname, sign.symbolcode, sign.color);
    setChanged(changed + 1); update();
  };
  const onSymbolCodeChange = async ({value}: NumericTextBoxChangeEvent) => {
    sign.symbolcode = value;
    sign.img = await signProvider.getImage(sign.fontname, sign.symbolcode, sign.color);
    setChanged(changed + 1); update();
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
              value={symbolcode} onChange={onSymbolCodeChange}
              min={minIndex} max={maxIndex} step={1}
              format={'#'} disabled={!validFontData}
            />
          </div>
        </fieldset>
        <fieldset>
          <div className={'edit-field'}>
            <span>Цвет:</span>
            <ColorPicker
              value={sign.color} onChange={onColorChange}
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
