import { useState } from 'react';
import { MenuSection, MenuSectionItem, ButtonIcon, BigButton } from 'shared/ui';
import { NumericTextBox, NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { CaratDrawer } from '../../rendering/drawer';

import scaleIcon from 'assets/images/carat/scale.svg';
import scaleUpIcon from 'assets/images/carat/scale-up.svg';
import scaleDownIcon from 'assets/images/carat/scale-down.svg';
import goToStratumIcon from 'assets/images/carat/go-to-stratum.svg';


interface CaratScalePanelProps {
  stage: ICaratStage,
  track: ICaratTrack,
}


export const CaratNavigationPanel = ({stage, track}: CaratScalePanelProps) => {
  const initScale = CaratDrawer.pixelPerMeter / track.viewport.scale;
  const [scale, setScale] = useState(initScale);

  const changeScale = (metersInMeter: number) => {
    const newScale = CaratDrawer.pixelPerMeter / metersInMeter;
    stage.setScale(newScale);
    stage.render();
    setScale(metersInMeter);
  };

  const onScaleChange = (e: NumericTextBoxChangeEvent) => {
    if (e.value) changeScale(e.value);
  };

  const scaleUp = () => changeScale(scale + 50);
  const scaleDown = () => changeScale(scale - 50);

  return (
    <MenuSection header={'Навигация и масштаб'} className={'menu-section-row'}>
      <MenuSectionItem className={'big-buttons'}>
        <BigButton text={'Перейти к'} icon={goToStratumIcon} action={() => {}}/>
      </MenuSectionItem>
      <MenuSectionItem className={'menu-list carat-scale'}>
        <ButtonIcon text={'Увеличить'} icon={scaleUpIcon} action={scaleUp}/>
        <ButtonIcon text={'Уменьшить'} icon={scaleDownIcon} action={scaleDown}/>
        <div>
          <img src={scaleIcon} alt="scale" width={16} height={16}/>
          <span style={{whiteSpace: 'pre'}}>1 / </span>
          <NumericTextBox
            width={100} style={{height: '20px'}} title={'Масштаб'}
            value={scale} onChange={onScaleChange} step={10}/>
        </div>
      </MenuSectionItem>
    </MenuSection>
  );
};
