import { useState } from 'react';
import { PropertyWindowProps, paletteSettings, gradientSettings } from '../properties-utils';

import './label-editor.scss';
import { AlignSwitcher } from './align-switcher';
import { Button } from 'antd';

import {
  ColorPicker, NumericTextBox, Checkbox, Input,
  InputChangeEvent, ColorPickerChangeEvent, NumericTextBoxChangeEvent, CheckboxChangeEvent,
} from '@progress/kendo-react-inputs';


export const LabelPropertyEditor = (props: PropertyWindowProps<MapLabel>) => {
  const [changed, setChanged] = useState(0);
  const { element: label, apply, update, cancel, t, isElementCreating } = props;

  const onTextChange = (event: InputChangeEvent) => {
    label.text = event.value;
    setChanged(changed + 1); update();
  };
  const onColorChange = (event: ColorPickerChangeEvent) => {
    label.color = event.value;
    setChanged(changed + 1); update();
  };
  const onFontSizeChange = (e: NumericTextBoxChangeEvent) => {
    label.fontsize = e.value;
    setChanged(changed + 1); update();
  };

  const onXOffsetChange = (e: NumericTextBoxChangeEvent) => {
    label.xoffset = e.value;
    setChanged(changed + 1); update();
  };
  const onYOffsetChange = (e: NumericTextBoxChangeEvent) => {
    label.yoffset = e.value;
    setChanged(changed + 1); update();
  };

  const onAlignmentChange = (h: MapLabelAlignment, v: MapLabelAlignment) => {
    label.halignment = h; label.valignment = v;
    setChanged(changed + 1); update();
  };
  const onAngleChange = (e: NumericTextBoxChangeEvent) => {
    label.angle = e.value;
    setChanged(changed + 1); update();
  };
  const onTransparentChange = (e: CheckboxChangeEvent) => {
    label.transparent = e.value;
    setChanged(changed + 1); update();
  };

  /* --- View --- */

  return (
    <div className={'label-properties'}>
      <fieldset style={{gridTemplateColumns: '2.5fr 1fr 1fr'}}>
        <div>
          <span>Текст:</span>
          <Input value={label.text} onChange={onTextChange}/>
        </div>
        <div>
          <span>Цвет:</span>
          <ColorPicker
            view={'gradient'} value={label.color} onChange={onColorChange}
            paletteSettings={paletteSettings} gradientSettings={gradientSettings}
          />
        </div>
        <div>
          <span>Размер:</span>
          <NumericTextBox value={label.fontsize} format={'#'} min={1} onChange={onFontSizeChange}/>
        </div>
      </fieldset>
      <fieldset style={{gridTemplateColumns: '1.1fr 1fr 1.3fr'}}>
        <div>
          <div>Выравнивание:</div>
          <div className={'label-offset'}>
            <AlignSwitcher h={label.halignment} v={label.valignment} onChange={onAlignmentChange}/>
          </div>
        </div>
        <div>
          <div>Смещение:</div>
          <div className={'params-pair'}>
            <div>
              <span>x:</span>
              <NumericTextBox value={label.xoffset} format={'#'} onChange={onXOffsetChange}/>
            </div>
            <div>
              <span>y:</span>
              <NumericTextBox value={label.yoffset} format={'#'} onChange={onYOffsetChange}/>
            </div>
          </div>
        </div>
        <div>
          <div>&nbsp;</div>
          <div className={'params-pair'}>
            <div>
              <span>Угол:</span>
              <NumericTextBox value={label.angle} min={-360} max={360}  style={{width: 78}} onChange={onAngleChange}/>
            </div>
            <div>
              <span>Прозрачность:</span>
              <Checkbox checked={label.transparent} style={{height: 16}} onChange={onTransparentChange}/>
            </div>
          </div>
        </div>
      </fieldset>
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
