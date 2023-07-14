import { CheckboxChangeEvent } from '@progress/kendo-react-inputs';
import {useState, useCallback, useRef} from 'react';
import { Checkbox } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import {TFunction} from "react-i18next";
import {IntlProvider, LocalizationProvider} from "@progress/kendo-react-intl";
import {Window} from "@progress/kendo-react-dialogs";
import {useDispatch, useSelector} from "react-redux";
import {setOpenedWindow, windowsSelector} from "../../../../../../entities/windows";
import {PaletteLevelChange} from "./palette-level-change";
import {rollbackFieldPalette} from "../properties-utils";


interface FieldPalettePropertiesProps {
  element: MapFieldPalette,
  init: MapFieldPalette,
  update: () => void,
  t: TFunction,
}

const fieldPalettePropertiesWindowSize = [320, 260];

export const FieldPalettePropertiesWindow = ({element: palette, init, update, t}: FieldPalettePropertiesProps) => {
  const dispatch = useDispatch();

  const [changed, setChanged] = useState(false);

  const [width, height] = fieldPalettePropertiesWindowSize;
  const title = 'Свойства палитры';

  const windowName = 'mapAdditionalPropertiesWindow';
  const windows = useSelector(windowsSelector);
  const windowRef = useRef(null);

  const onChange = useCallback(() => {
    setChanged(true);
    update();
  }, [update]);

  /* --- FieldPalette Properties State --- */

  const [interpolated, setInterpolated] = useState(palette.interpolated);

  /* --- Properties Handlers --- */

  const close = useCallback(() => {
    let position;
    if (windowRef.current) position = {top: windowRef.current.top, left: windowRef.current.left};
    dispatch(setOpenedWindow(windowName, false, null, position));
  }, [dispatch]);

  const cancel = () => {
    rollbackFieldPalette(palette, init);
    update();
    close();
  }

  const apply = () => {
    console.log('apply');
    update();
    close();
  }

  const onInterpolatedChange = useCallback((e: CheckboxChangeEvent) => {
    palette.interpolated = e.value ? '-1' : '0';
    setInterpolated(palette.interpolated);
    onChange();
  }, [palette, onChange]);

  /* --- View --- */

  const colorsChangeElements = palette?.level?.length ?
    palette?.level?.map(
      (level, index) =>
    <PaletteLevelChange level={level} onChange={onChange} key={index}/>
  ) : <div />;

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        <Window
          ref={windowRef} className={'propertiesWindow'}
          resizable={false} title={title}
          width={width} height={height}
          initialLeft={windows[windowName]?.position?.left}
          initialTop={windows[windowName]?.position?.top}
          style={{zIndex: 99}} onClose={cancel} key={windowName}
        >
          <div className={'label-properties'}>
            <fieldset>
              <div>
                <span>Сглаживание:</span>
                <Checkbox checked={interpolated === '-1'} style={{marginLeft: 5, height: 16}} onChange={onInterpolatedChange}/>
              </div>
              <div className={'colors'}>
                {colorsChangeElements}
              </div>
            </fieldset>
            <div>
              <Button disabled={ !changed } onClick={apply}>{t('base.apply')}</Button>
              <Button onClick={cancel}>{t('base.cancel')}</Button>
            </div>
          </div>
        </Window>
      </IntlProvider>
    </LocalizationProvider>
  );
}

