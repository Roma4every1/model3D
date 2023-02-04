import { TFunction } from 'react-i18next';
import { InputChangeEvent, ColorPickerChangeEvent } from '@progress/kendo-react-inputs';
import { NumericTextBoxChangeEvent, CheckboxChangeEvent } from '@progress/kendo-react-inputs';
import { useState, useCallback } from 'react';
import { ColorPicker, NumericTextBox, Checkbox, Input } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { InitLabelState, paletteSettings, gradientSettings } from '../properties-utils';
import { AlignSwitcher } from './align-switcher';
import './label-properties.scss';


interface LabelPropertiesProps {
  element: MapLabel,
  init: InitLabelState,
  apply: () => void,
  update: () => void,
  cancel: () => void,
  t: TFunction,
}


export const LabelProperties = ({element: label, init, apply, update, cancel, t}: LabelPropertiesProps) => {
  const [changed, setChanged] = useState(false);

  const onChange = useCallback(() => {
    setChanged(true);
    update();
  }, [update]);

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

  const onTextChange = useCallback((event: InputChangeEvent) => {
    label.text = event.value;
    setText(label.text);
    onChange();
  }, [label, onChange]);

  const onColorChange = useCallback((event: ColorPickerChangeEvent) => {
    label.color = event.value;
    setColor(label.color);
    onChange();
  }, [label, onChange]);

  const onFontSizeChange = useCallback((e: NumericTextBoxChangeEvent) => {
    label.fontsize = e.value;
    setFontSize(label.fontsize);
    onChange();
  }, [label, onChange]);

  const onXOffsetChange = useCallback((e: NumericTextBoxChangeEvent) => {
    label.xoffset = e.value;
    setXOffset(label.xoffset);
    onChange();
  }, [label, onChange]);

  const onYOffsetChange = useCallback((e: NumericTextBoxChangeEvent) => {
    label.yoffset = e.value;
    setYOffset(label.yoffset);
    onChange();
  }, [label, onChange]);

  const onAlignmentChange = useCallback((h: MapLabelAlignment, v: MapLabelAlignment) => {
    label.halignment = h; label.valignment = v;
    setHAlignment(h); setVAlignment(v);
    onChange();
  }, [label, onChange]);

  const onAngleChange = useCallback((e: NumericTextBoxChangeEvent) => {
    label.angle = e.value;
    setAngle(label.angle);
    onChange();
  }, [label, onChange]);

  const onTransparentChange = useCallback((e: CheckboxChangeEvent) => {
    label.transparent = e.value;
    setTransparent(label.transparent);
    onChange();
  }, [label, onChange]);

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
          <NumericTextBox value={fontSize} format={'#'} onChange={onFontSizeChange}/>
        </div>
      </fieldset>
      <fieldset style={{gridTemplateColumns: '1fr 1fr 1.5fr'}}>
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
      <div>
        <Button disabled={!changed} onClick={apply}>{t('base.apply')}</Button>
        <Button onClick={cancel}>{t('base.cancel')}</Button>
      </div>
    </div>
  );
}

