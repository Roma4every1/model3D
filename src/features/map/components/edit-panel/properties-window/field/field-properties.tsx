import {createFieldPaletteInit, InitFieldState} from "../properties-utils";
import {TFunction} from "react-i18next";
import {useCallback, useState} from "react";
import {
  NumericTextBox,
  NumericTextBoxChangeEvent
} from "@progress/kendo-react-inputs";
import {Button} from "@progress/kendo-react-buttons";
import {setOpenedWindow} from "../../../../../../entities/windows";
import {useDispatch} from "react-redux";
import {FieldPalettePropertiesWindow} from "./field-palette-properties";

interface FieldPropertiesProps {
  element: MapField,
  init: InitFieldState,
  apply: () => void,
  update: () => void,
  cancel: () => void,
  t: TFunction,
  isElementCreating: boolean,
}


export const FieldProperties = ({element: field, init, apply, update, cancel, t, isElementCreating}: FieldPropertiesProps) => {
  const dispatch = useDispatch();
  const [changed, setChanged] = useState(false);

  const onChange = useCallback(() => {
    setChanged(true);
    update();
  }, [update]);

  /* --- Field Properties State --- */

  const [boundX, setBoundX] = useState(init.x);
  const [boundY, setBoundY] = useState(init.y);

  const [sizeX, setSizeX] = useState(init.sizex);
  const [sizeY, setSizeY] = useState(init.sizey);

  const [stepX, setStepX] = useState(init.stepx);
  const [stepY, setStepY] = useState(init.stepy);


  /* --- Properties Handlers --- */

  const onBoundXChange = useCallback((e: NumericTextBoxChangeEvent) => {
    field.x = e.value;
    setBoundX(field.x);
    onChange();
  }, [field, onChange]);

  const onBoundYChange = useCallback((e: NumericTextBoxChangeEvent) => {
    field.y = e.value;
    setBoundY(field.y);
    onChange();
  }, [field, onChange]);

  const onSizeXChange = useCallback((e: NumericTextBoxChangeEvent) => {
    field.sizex = e.value;
    setSizeX(field.sizex);
    onChange();
  }, [field, onChange]);

  const onSizeYChange = useCallback((e: NumericTextBoxChangeEvent) => {
    field.sizey = e.value;
    setSizeY(field.sizey);
    onChange();
  }, [field, onChange]);

  const onStepXChange = useCallback((e: NumericTextBoxChangeEvent) => {
    field.stepx = e.value;
    setStepX(field.stepx);
    onChange();
  }, [field, onChange]);

  const onStepYChange = useCallback((e: NumericTextBoxChangeEvent) => {
    field.stepy = e.value;
    setStepY(field.stepy);
    onChange();
  }, [field, onChange]);

  const openPaletteWindow = () => {
    const name = 'mapAdditionalPropertiesWindow';
    const init = createFieldPaletteInit(field.palette[0]);
    const window = <FieldPalettePropertiesWindow
      element={field.palette[0]} update={update} t={t} init={init}
    />;
    dispatch(setOpenedWindow(name, true, window));
  };

  /* --- View --- */

  return (
    <div className={'label-properties'}>
      <fieldset style={{gridTemplateColumns: '1fr 1fr'}}>
        <div>
          <Button onClick={openPaletteWindow}>Палитра</Button>
        </div>
      </fieldset>
      <fieldset style={{gridTemplateColumns: '1fr 1fr'}}>
        <div>
          <span>Привязка по X:</span>
          <NumericTextBox value={boundX} format={'#'} onChange={onBoundXChange}/>
        </div>
        <div>
          <span>Привязка по Y:</span>
          <NumericTextBox value={boundY} format={'#'} onChange={onBoundYChange}/>
        </div>
      </fieldset>
      <fieldset style={{gridTemplateColumns: '1fr 1fr'}}>
        <div>
          <span>Узлов по горизонтали:</span>
          <NumericTextBox value={sizeX} format={'#'} min={1} onChange={onSizeXChange}/>
        </div>
        <div>
          <span>Узлов по вертикали:</span>
          <NumericTextBox value={sizeY} format={'#'} min={1} onChange={onSizeYChange}/>
        </div>
      </fieldset>
      <fieldset style={{gridTemplateColumns: '1fr 1fr'}}>
        <div>
          <span>Шаг по горизонтали:</span>
          <NumericTextBox value={stepX} format={'#'} min={1} onChange={onStepXChange}/>
        </div>
        <div>
          <span>Шаг по вертикали:</span>
          <NumericTextBox value={stepY} format={'#'} min={1} onChange={onStepYChange}/>
        </div>
      </fieldset>
      <div>
        <Button disabled={ isElementCreating ? false : !changed } onClick={apply}>{t('base.apply')}</Button>
        <Button onClick={cancel}>{t('base.cancel')}</Button>
      </div>
    </div>
  );
}
