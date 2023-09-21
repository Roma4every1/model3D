import { useState } from 'react';
import { TFunction } from 'react-i18next';
import { InitLabelState, paletteSettings, gradientSettings } from '../properties-utils';

import './label-properties.scss';
import { AlignSwitcher } from './align-switcher';
import { Button } from '@progress/kendo-react-buttons';

import {
  ColorPicker, NumericTextBox, Checkbox, Input,
  InputChangeEvent, ColorPickerChangeEvent, NumericTextBoxChangeEvent, CheckboxChangeEvent,
} from '@progress/kendo-react-inputs';


interface LabelPropertiesProps {
  element: MapLabel;
  init: InitLabelState;
  apply: () => void;
  update: () => void;
  cancel: () => void;
  t: TFunction;
  isElementCreating: boolean;
}


export const LabelProperties = (props: LabelPropertiesProps) => {
  const { element: label, init, apply, update, cancel, t, isElementCreating } = props;
  const [changed, setChanged] = useState(false);

  /* --- Polyline Properties State --- */

  const [text, setText] = useState(init.text);
  const [color, setColor] = useState(init.color ?? null);
  const [fontSize, setFontSize] = useState(init.fontSize);

  const [xOffset, setXOffset] = useState(init.xOffset);
  const [yOffset, setYOffset] = useState(init.yOffset);
  const [hAlignment, setHAlignment] = useState<MapLabelAlignment>(init.hAlignment);
  const [vAlignment, setVAlignment] = useState<MapLabelAlignment>(init.vAlignment);

  const [angle, setAngle] = useState(init.angle);
  const [transparent, setTransparent] = useState(init.transparent);

  /* --- Properties Handlers --- */

  const onTextChange = (event: InputChangeEvent) => {
    label.text = event.value;
    setText(label.text);
    setChanged(true); update();
  };
  const onColorChange = (event: ColorPickerChangeEvent) => {
    label.color = event.value;
    setColor(label.color);
    setChanged(true); update();
  };
  const onFontSizeChange = (e: NumericTextBoxChangeEvent) => {
    label.fontsize = e.value;
    setFontSize(label.fontsize);
    setChanged(true); update();
  };

  const onXOffsetChange = (e: NumericTextBoxChangeEvent) => {
    label.xoffset = e.value;
    setXOffset(label.xoffset);
    setChanged(true); update();
  };
  const onYOffsetChange = (e: NumericTextBoxChangeEvent) => {
    label.yoffset = e.value;
    setYOffset(label.yoffset);
    setChanged(true); update();
  };

  const onAlignmentChange = (h: MapLabelAlignment, v: MapLabelAlignment) => {
    label.halignment = h; label.valignment = v;
    setHAlignment(h); setVAlignment(v);
    setChanged(true); update();
  };
  const onAngleChange = (e: NumericTextBoxChangeEvent) => {
    label.angle = e.value;
    setAngle(label.angle);
    setChanged(true); update();
  };
  const onTransparentChange = (e: CheckboxChangeEvent) => {
    label.transparent = e.value;
    setTransparent(label.transparent);
    setChanged(true); update();
  };

  /* --- View --- */

  return (
    <div className={'label-properties'}>
      <fieldset style={{gridTemplateColumns: '2.5fr 1fr 1fr'}}>
        <div>
          <span>Текст:</span>
          <Input value={text} onChange={onTextChange}/>
        </div>
        <div>
          <span>Цвет:</span>
          <ColorPicker
            view={'gradient'} value={color} onChange={onColorChange}
            paletteSettings={paletteSettings} gradientSettings={gradientSettings}
          />
        </div>
        <div>
          <span>Размер:</span>
          <NumericTextBox value={fontSize} format={'#'} min={1} onChange={onFontSizeChange}/>
        </div>
      </fieldset>
      <fieldset style={{gridTemplateColumns: '1.1fr 1fr 1.3fr'}}>
        <div>
          <div>Выравнивание:</div>
          <div className={'label-offset'}>
            <AlignSwitcher h={hAlignment} v={vAlignment} onChange={onAlignmentChange}/>
          </div>
        </div>
        <div>
          <div>Смещение:</div>
          <div className={'params-pair'}>
            <div>
              <span>x:</span>
              <NumericTextBox value={xOffset} format={'#'} onChange={onXOffsetChange}/>
            </div>
            <div>
              <span>y:</span>
              <NumericTextBox value={yOffset} format={'#'} onChange={onYOffsetChange}/>
            </div>
          </div>
        </div>
        <div>
          <div>&nbsp;</div>
          <div className={'params-pair'}>
            <div>
              <span>Угол:</span>
              <NumericTextBox value={angle} min={-360} max={360}  style={{width: 78}} onChange={onAngleChange}/>
            </div>
            <div>
              <span>Прозрачность:</span>
              <Checkbox checked={transparent} style={{height: 16}} onChange={onTransparentChange}/>
            </div>
          </div>
        </div>
      </fieldset>
      <div className={'wm-dialog-actions'} style={{paddingTop: 6}}>
        <Button disabled={ isElementCreating ? false : !changed } onClick={apply}>
          {t('base.apply')}
        </Button>
        <Button onClick={cancel}>
          {t('base.cancel')}
        </Button>
      </div>
    </div>
  );
};
