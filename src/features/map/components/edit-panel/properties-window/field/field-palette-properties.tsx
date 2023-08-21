import { TFunction } from 'react-i18next';
import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenedWindow, windowsSelector } from 'entities/window';
import { rollbackFieldPalette } from '../properties-utils';

import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { Window } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { Checkbox, CheckboxChangeEvent } from '@progress/kendo-react-inputs';
import { PaletteLevelChange } from './palette-level-change';


interface FieldPalettePropertiesProps {
  element: MapFieldPalette,
  init: MapFieldPalette,
  update: () => void,
  t: TFunction,
}


export const FieldPalettePropertiesWindow = (props: FieldPalettePropertiesProps) => {
  const dispatch = useDispatch();
  const { element: palette, init, update, t } = props;
  const [changed, setChanged] = useState(false);

  const windowName = 'mapAdditionalPropertiesWindow';
  const windows = useSelector(windowsSelector);
  const windowRef = useRef(null);

  const onChange = () => {
    setChanged(true);
    update();
  };

  const close = () => {
    let position;
    if (windowRef.current) position = {top: windowRef.current.top, left: windowRef.current.left};
    dispatch(setOpenedWindow(windowName, false, null, position));
  };

  const cancel = () => {
    rollbackFieldPalette(palette, init);
    update();
    close();
  };

  const apply = () => {
    update();
    close();
  };

  /* --- FieldPalette Properties State --- */

  const [interpolated, setInterpolated] = useState(palette.interpolated);

  /* --- Properties Handlers --- */

  const onInterpolatedChange =(e: CheckboxChangeEvent) => {
    palette.interpolated = e.value ? '-1' : '0';
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
        <Window
          ref={windowRef} className={'propertiesWindow'}
          resizable={false} title={'Свойства палитры'}
          width={320} height={260}
          initialLeft={windows[windowName]?.position?.left}
          initialTop={windows[windowName]?.position?.top}
          style={{zIndex: 99}} onClose={cancel} key={windowName}
        >
          <div className={'label-properties'}>
            <fieldset>
              <div>
                <span>Сглаживание:</span>
                <Checkbox
                  style={{marginLeft: 5, height: 16}}
                  checked={interpolated === '-1'} onChange={onInterpolatedChange}
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
        </Window>
      </IntlProvider>
    </LocalizationProvider>
  );
};
