import { MouseEvent, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { stratumStateSelector } from 'entities/objects';
import { channelSelector, createLookupList } from 'entities/channels';
import { MenuSection, MenuSectionItem, ButtonIcon, BigButton } from 'shared/ui';
import { Popup } from '@progress/kendo-react-popup';
import { NumericTextBox, NumericTextBoxChangeEvent, NumericTextBoxHandle } from '@progress/kendo-react-inputs';
import { CaratIntervalModel } from '../../lib/types';
import { CaratDrawer } from '../../rendering/drawer';

import scaleIcon from 'assets/images/carat/scale.svg';
import scaleUpIcon from 'assets/images/carat/scale-up.svg';
import scaleDownIcon from 'assets/images/carat/scale-down.svg';
import goToStratumIcon from 'assets/images/carat/go-to-stratum.svg';
import alignByStratumIcon from 'assets/images/carat/align-by-stratum.svg';


interface CaratScalePanelProps {
  stage: ICaratStage;
  track: ICaratTrack;
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
  const { t } = useTranslation();
  const ref = useRef<NumericTextBoxHandle>();
  const [scale, setScale] = useState(CaratDrawer.pixelPerMeter / track.viewport.scale);

  // чтобы работало изменение 1 -> 10 вместо 11
  useLayoutEffect(() => {
    if (ref.current) ref.current.element.value = scale.toString();
  }, [scale]);

  const changeScale = (newScale: number) => {
    setScale(newScale);
    if (newScale < 1) newScale = 1;
    stage.edit({type: 'scale', payload: CaratDrawer.pixelPerMeter / newScale});
    stage.render();
  };

  const onScaleChange = (e: NumericTextBoxChangeEvent) => {
    let newScale = e.value;
    if (newScale === null) return;
    if (scale === 1 && newScale === 11) newScale = 10;
    changeScale(newScale);
  };

  const scaleUp = () => {
    let newScale = scale === 1 ? 50 : scale + 50;
    if (newScale > 25_000) newScale = 25_000;
    changeScale(newScale);
  };

  const scaleDown = () => {
    let newScale = scale - 50;
    if (newScale < 1) newScale = 1;
    changeScale(newScale);
  };

  return (
    <MenuSectionItem className={'menu-list carat-scale'}>
      <ButtonIcon
        text={t('carat.navigation.up')} icon={scaleUpIcon}
        action={scaleUp} disabled={scale >= 25_000}
      />
      <ButtonIcon
        text={t('carat.navigation.down')} icon={scaleDownIcon}
        action={scaleDown} disabled={scale <= 0}
      />
      <div>
        <img src={scaleIcon} alt={'scale'} width={16} height={16}/>
        <span style={{whiteSpace: 'pre'}}>1 / </span>
        <NumericTextBox
          ref={ref} title={t('carat.navigation.scale')}
          width={100} style={{height: '20px'}} format={'#'}
          value={scale} step={10} min={1} max={25_000} onChange={onScaleChange}
        />
      </div>
    </MenuSectionItem>
  );
};

const NavigationSection = ({stage, track}: CaratScalePanelProps) => {
  const { t } = useTranslation();
  const { model: currentStratum } = useSelector(stratumStateSelector);

  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const inclinometry = track.inclinometry;
  const backgroundColumns = track.getBackgroundGroup().getColumns();
  const strataColumn = backgroundColumns.find(c => c.channel.type === 'lithology');
  const strata: CaratIntervalModel[] = strataColumn?.getElements() ?? [];

  const lookupName = strataColumn?.channel.namesChannel;
  const lookupData: Channel = useSelector(channelSelector.bind(lookupName));

  const nameDict: LookupDict<string> = useMemo(() => {
    const rows = lookupData?.data?.rows;
    if (!rows) return {};
    return createLookupList(rows, lookupData.info.lookupColumns)[1];
  }, [lookupData]);

  const showStrata = (event: MouseEvent) => {
    const target = event.currentTarget;
    if (anchor !== target) setAnchor(target);
    setIsOpen(!isOpen);
  };

  const align = () => {
    stage.gotoStratum(currentStratum.id);
    stage.render();
  };

  const toTop = (id: StratumID) => {
    stage.alignByStratum(id, true);
    stage.render(); setIsOpen(false);
  };
  const toBottom = (id: StratumID) => {
    stage.alignByStratum(id, false);
    stage.render(); setIsOpen(false);
  };

  const elementToListItem = (element: CaratIntervalModel, i: number) => {
    const name = nameDict[element.stratumID];
    if (name === undefined) return null;

    const top = Math.round(inclinometry?.getAbsMark(element.top) ?? -element.top);
    const bottom = Math.round(inclinometry?.getAbsMark(element.bottom) ?? -element.bottom);

    const onClickTop = () => toTop(element.stratumID);
    const onClickBottom = () => toBottom(element.stratumID);

    return (
      <div key={i}>
        <strong>{name + ' '}</strong>
        <span onClick={onClickTop} title={t('carat.navigation.top-abs-mark')}>{top}</span>
        {' 🠖 '}
        <span onClick={onClickBottom} title={t('carat.navigation.bottom-abs-mark')}>{bottom}</span>
      </div>
    );
  };

  return (
    <>
      <MenuSectionItem className={'big-buttons'}>
        <BigButton
          text={t('carat.navigation.goto')} icon={goToStratumIcon}
          action={showStrata} disabled={strata.length === 0}
        />
        <BigButton
          text={t('carat.navigation.align')} icon={alignByStratumIcon}
          action={align} disabled={!currentStratum}
        />
      </MenuSectionItem>
      <Popup className={'dropdown-popup'} show={isOpen} anchor={anchor}>
        {currentStratum && <div className={'strata-list'}>
          <div className={'active-stratum'} onClick={() => toTop(currentStratum.id)}>
            {t('carat.navigation.active-top')}</div>
          <div className={'active-stratum'} onClick={() => toBottom(currentStratum.id)}>
            {t('carat.navigation.active-bottom')}
          </div>
        </div>}
        <div className={'strata-list'}>
          {strata.map(elementToListItem)}
        </div>
      </Popup>
    </>
  );
};
