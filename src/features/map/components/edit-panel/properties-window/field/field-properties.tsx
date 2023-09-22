import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { showWindow, closeWindow } from 'entities/window';
import { PropertyWindowProps } from '../properties-utils';
import { Button } from '@progress/kendo-react-buttons';
import { NumericTextBox, NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { FieldPalettePropertiesWindow } from './field-palette-properties';


export const FieldProperties = (props: PropertyWindowProps<MapField>) => {
  const dispatch = useDispatch();
  const [changed, setChanged] = useState(false);
  const { element: field, init, apply, update, cancel, t, isElementCreating } = props;

  /* --- Field Properties State --- */

  const [boundX, setBoundX] = useState(init.x);
  const [boundY, setBoundY] = useState(init.y);

  const [sizeX, setSizeX] = useState(init.sizex);
  const [sizeY, setSizeY] = useState(init.sizey);

  const [stepX, setStepX] = useState(init.stepx);
  const [stepY, setStepY] = useState(init.stepy);

  /* --- Properties Handlers --- */

  const onBoundXChange = (e: NumericTextBoxChangeEvent) => {
    field.x = e.value;
    setBoundX(field.x);
    setChanged(true); update();
  };

  const onBoundYChange = (e: NumericTextBoxChangeEvent) => {
    field.y = e.value;
    setBoundY(field.y);
    setChanged(true); update();
  };

  const onSizeXChange = (e: NumericTextBoxChangeEvent) => {
    field.sizex = e.value;
    setSizeX(field.sizex);
    setChanged(true); update();
  };

  const onSizeYChange = (e: NumericTextBoxChangeEvent) => {
    field.sizey = e.value;
    setSizeY(field.sizey);
    setChanged(true); update();
  };

  const onStepXChange = (e: NumericTextBoxChangeEvent) => {
    field.stepx = e.value;
    setStepX(field.stepx);
    setChanged(true); update();
  };

  const onStepYChange = (e: NumericTextBoxChangeEvent) => {
    field.stepy = e.value;
    setStepY(field.stepy);
    setChanged(true); update();
  };

  const openPaletteWindow = () => {
    const windowID = 'mapAdditionalPropertiesWindow';
    const onClose = () => dispatch(closeWindow(windowID));

    const content = <FieldPalettePropertiesWindow
      onClose={onClose} element={field.palette[0]} update={update} t={t}
      init={init.palette[0]}
    />;
    const windowProps = {
      title: 'Свойства палитры', className: 'propertiesWindow',
      resizable: false, width: 320, height: 260, style: {zIndex: 99}, onClose,
    };
    dispatch(showWindow(windowID, windowProps, content));
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
        <Button onClick={apply} disabled={ isElementCreating ? false : !changed }>
          {t('base.apply')}
        </Button>
        <Button onClick={cancel}>
          {t('base.cancel')}
        </Button>
      </div>
    </div>
  );
};
