import { TFunction } from "react-i18next";
import { InputChangeEvent, ColorPicker, ColorPickerChangeEvent } from "@progress/kendo-react-inputs";
import { useState, useCallback } from "react";
import { Button } from "@progress/kendo-react-buttons";
import StringTextEditor from "../../../../editors/StringTextEditor";
import { InitLabelState, paletteSettings } from "./properties-utils";


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
  const [color, setColor] = useState(init.color || null);

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
  }, [label, onChange])

  /* --- View --- */

  return (
    <div>
      <div>
        <div>Текст подписи:</div>
        <StringTextEditor id={'edited-label-text'} value={text} selectionChanged={onTextChange}/>
      </div>
      <div>
        <div>Цвет текста:</div>
        <ColorPicker
          view="combo"
          paletteSettings={paletteSettings}
          value={color}
          onChange={onColorChange}
        />
      </div>
      <div>
        <Button disabled={!changed} onClick={apply}>{t('base.apply')}</Button>
        <Button onClick={cancel}>{t('base.cancel')}</Button>
      </div>
    </div>
  );
}