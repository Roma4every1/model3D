import { useState } from 'react';
import { TFunction } from 'react-i18next';
import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { Button } from '@progress/kendo-react-buttons';
import { Checkbox, CheckboxChangeEvent } from '@progress/kendo-react-inputs';
import { PaletteLevelChange } from './palette-level-change';


interface FieldPalettePropertiesProps {
  element: MapFieldPalette;
  init: MapFieldPalette;
  update: () => void;
  t: TFunction;
  onClose: () => void;
}


export const FieldPalettePropertiesWindow = (props: FieldPalettePropertiesProps) => {
  const { element: palette, init, update, t, onClose } = props;
  const [changed, setChanged] = useState(false);

  const onChange = () => {
    setChanged(true);
    update();
  };

  const cancel = () => {
    for (const key in palette) palette[key] = init[key];
    update();
    onClose();
  };

  const apply = () => {
    update();
    onClose();
  };

  /* --- FieldPalette Properties State --- */

  const [interpolated, setInterpolated] = useState(palette.interpolated);

  /* --- Properties Handlers --- */

  const onInterpolatedChange =(e: CheckboxChangeEvent) => {
    palette.interpolated = e.value;
    setInterpolated(palette.interpolated);
    onChange();
  };

  /* --- View --- */

  const colorsChangeElements = palette?.level?.length
    ? palette.level.map((level, index) => {
      return <PaletteLevelChange level={level} onChange={onChange} key={index}/>;
    }) : <div/>;

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
          <div className={'label-properties'}>
            <fieldset>
              <div>
                <span>Сглаживание:</span>
                <Checkbox
                  style={{marginLeft: 5, height: 16}}
                  checked={interpolated} onChange={onInterpolatedChange}
                />
              </div>
              <div className={'colors'}>
                {colorsChangeElements}
              </div>
            </fieldset>
            <div>
              <Button disabled={!changed} onClick={apply}>{t('base.apply')}</Button>
              <Button onClick={cancel}>{t('base.cancel')}</Button>
            </div>
          </div>
      </IntlProvider>
    </LocalizationProvider>
  );
};
