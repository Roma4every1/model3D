import { useState } from 'react';
import { rgb } from 'd3-color';
import { gradientSettings, paletteSettings } from '../properties-utils';

import {
  ColorPicker, ColorPickerChangeEvent,
  NumericTextBox, NumericTextBoxChangeEvent
} from '@progress/kendo-react-inputs';


interface PaletteLevelChangeProps {
  level: MapFieldPaletteLevel,
  onChange: () => void,
}


export const PaletteLevelChange = ({level, onChange}: PaletteLevelChangeProps) => {
  const [color, setColor] = useState(level.color ?? null);
  const [value, setValue] = useState(level.value);

  const onColorChange = (e: ColorPickerChangeEvent) => {
    level.color = rgb(e.value).formatHex();
    setColor(level.color);
    onChange();
  };

  const onValueChange = (e: NumericTextBoxChangeEvent) => {
    level.value = e.value;
    setValue(level.value);
    onChange();
  };

  return (
    <fieldset style={{gridTemplateColumns: 'auto 1fr', columnGap: '10px'}}>
      <ColorPicker
        view={'gradient'} value={color} onChange={onColorChange}
        paletteSettings={paletteSettings} gradientSettings={gradientSettings}
      />
      <NumericTextBox value={value} format={'#'} onChange={onValueChange}/>
    </fieldset>
  );
};
