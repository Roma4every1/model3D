import { useState } from 'react';
import { ButtonStock, MenuSection } from 'shared/ui';
import { NumericTextBox, NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { CaratDrawer } from '../../rendering/drawer';


interface CaratScalePanelProps {
  stage: ICaratStage,
  track: ICaratTrack,
}


export const CaratScalePanel = ({stage, track}: CaratScalePanelProps) => {
  const initMetersInMeter = CaratDrawer.pixelPerMeter / track.getViewport().scale;
  const [metersInMeter, setMetersInMeter] = useState(initMetersInMeter);

  const changeMetersInMeter = (metersInMeter: number) => {
    const newScale = CaratDrawer.pixelPerMeter / metersInMeter;
    stage.setScale(newScale);
    stage.render();
    setMetersInMeter(metersInMeter);
  };

  const onMetersInMeterChange = (e: NumericTextBoxChangeEvent) => {
    if (e.value) changeMetersInMeter(e.value);
  };

  const zoomIn = () => changeMetersInMeter(metersInMeter + 50);
  const zoomOut = () => changeMetersInMeter(metersInMeter - 50);

  return (
    <MenuSection header={'Масштаб'} className={'menu-list carat-scale'} style={{padding: '0 2px'}}>
      <ButtonStock text={'Увеличить'} icon={'zoom-in'} action={zoomIn}/>
      <ButtonStock text={'Уменьшить'} icon={'zoom-out'} action={zoomOut}/>
      <div>
        <span className={'k-icon k-i-pan'}/>
        <span>1 / </span>
        <NumericTextBox
          width={100} style={{height: '20px'}}
          value={metersInMeter} onChange={onMetersInMeterChange} step={10}/>
      </div>
    </MenuSection>
  );
};
