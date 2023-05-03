import { MouseEvent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { channelSelector, createLookupList } from 'entities/channels';
import { MenuSection, MenuSectionItem, ButtonIcon, BigButton } from 'shared/ui';
import { Popup } from '@progress/kendo-react-popup';
import { NumericTextBox, NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { CaratElementInterval } from '../../lib/types';
import { CaratDrawer } from '../../rendering/drawer';

import scaleIcon from 'assets/images/carat/scale.svg';
import scaleUpIcon from 'assets/images/carat/scale-up.svg';
import scaleDownIcon from 'assets/images/carat/scale-down.svg';
import goToStratumIcon from 'assets/images/carat/go-to-stratum.svg';


interface CaratScalePanelProps {
  stage: ICaratStage,
  track: ICaratTrack,
}
interface StrataListElementProps {
  name: string,
  element: CaratElementInterval,
  onClick: () => void,
}


export const CaratNavigationPanel = (props: CaratScalePanelProps) => {
  return (
    <MenuSection header={'Навигация и масштаб'} className={'menu-section-row'}>
      <NavigationSection {...props}/>
      <ScaleSection {...props}/>
    </MenuSection>
  );
};

const ScaleSection = ({stage, track}: CaratScalePanelProps) => {
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
  );
};

const NavigationSection = ({stage, track}: CaratScalePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const backgroundColumns = track.getBackgroundGroup().getColumns();
  const strataColumn = backgroundColumns.find((column) => column.channel.type === 'lithology');
  const strata: CaratElementInterval[] = strataColumn?.getElements() ?? [];

  const lookupName = strataColumn?.channel.namesChannel;
  const lookupData: Channel = useSelector(channelSelector.bind(lookupName));

  const nameDict = useMemo(() => {
    const rows = lookupData?.data?.rows;
    if (!rows) return {};
    return createLookupList(rows, lookupData.info.lookupColumns)[1];
  }, [lookupData]);

  const showStrata = (event: MouseEvent) => {
    const target = event.currentTarget;
    if (anchor !== target) setAnchor(target);
    setIsOpen(!isOpen);
  };

  const setViewportY = (y: number) => {
    track.viewport.y = y;
    stage.render();
  };

  const elementToListItem = (element: CaratElementInterval, i: number) => {
    const name = nameDict[element.stratumID];
    const onClick = () => setViewportY(element.top);
    return <StrataListElement key={i} name={name} element={element} onClick={onClick}/>;
  };

  return (
    <>
      <MenuSectionItem className={'big-buttons'}>
        <BigButton
          text={'Перейти к'} icon={goToStratumIcon}
          action={showStrata} disabled={strata.length === 0}
        />
      </MenuSectionItem>
      <Popup className={'dropdown-popup'} show={isOpen} anchor={anchor}>
        <div className={'strata-list'}>
          {strata.map(elementToListItem)}
        </div>
      </Popup>
    </>
  );
};

const StrataListElement = ({name, element, onClick}: StrataListElementProps) => {
  return (
    <div onClick={onClick}>
      {name + ' ' + element.top + ' - ' + element.base}
    </div>
  );
};
