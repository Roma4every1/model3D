import { MouseEvent, useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentStratum } from 'entities/objects';
import { useChannel, createLookupList } from 'entities/channel';
import { validateCaratScale } from '../../lib/utils';
import { constraints } from '../../lib/constants';
import { MenuSection, MenuSectionItem, ButtonIcon, BigButton } from 'shared/ui';
import { Popup } from '@progress/kendo-react-popup';
import { NumericTextBox, NumericTextBoxChangeEvent, NumericTextBoxHandle } from '@progress/kendo-react-inputs';

import { CaratStage } from '../../rendering/stage';
import { CaratDrawer } from '../../rendering/drawer';
import { CaratIntervalModel } from '../../lib/types';

import scaleIcon from 'assets/carat/scale.svg';
import scaleUpIcon from 'assets/carat/scale-up.svg';
import scaleDownIcon from 'assets/carat/scale-down.svg';
import goToStratumIcon from 'assets/carat/go-to-stratum.svg';
import alignByStratumIcon from 'assets/carat/align-by-stratum.svg';


interface CaratScalePanelProps {
  stage: CaratStage;
}


export const CaratNavigationSection = ({stage}: CaratScalePanelProps) => {
  return (
    <MenuSection header={'Навигация и масштаб'} className={'menu-section-row'}>
      <NavigationSection stage={stage}/>
      <ScaleSection stage={stage}/>
    </MenuSection>
  );
};

const ScaleSection = ({stage}: CaratScalePanelProps) => {
  const { t } = useTranslation();
  const ref = useRef<NumericTextBoxHandle>();

  const track = stage.getActiveTrack();
  const initScale = Math.round(CaratDrawer.pixelPerMeter / track.viewport.scale);
  const [scale, setScale] = useState(initScale);

  let step = 10;
  let buttonStep = 50;
  let { min: minScale, max: maxScale } = constraints.scale;
  if (track.constructionMode) { maxScale = Infinity; step *= 5; buttonStep *= 5; }

  // подписка на изменение масштаба сцены
  useEffect(() => {
    const callback = (newScale: number) => setScale(newScale);
    stage.subscribe('scale', callback);
    return () => stage.unsubscribe('scale', callback);
  }, [stage]);

  // чтобы работало изменение 1 -> 10 вместо 11
  useLayoutEffect(() => {
    if (ref.current) ref.current.element.value = scale.toString();
  }, [scale]);

  const changeScale = (newScale: number) => {
    newScale = validateCaratScale(newScale, !track.constructionMode);
    stage.setScale(newScale);
    stage.render();
  };

  const onScaleChange = (e: NumericTextBoxChangeEvent) => {
    let newScale = e.value;
    if (newScale === null) return;
    if (scale === 1 && newScale === step + 1) newScale = step;
    changeScale(newScale);
  };

  const scaleUp = () => changeScale(scale === 1 ? buttonStep : scale + buttonStep);
  const scaleDown = () => changeScale(scale - buttonStep);

  return (
    <MenuSectionItem className={'menu-list carat-scale'}>
      <ButtonIcon
        text={t('carat.navigation.up')} icon={scaleUpIcon}
        action={scaleUp} disabled={scale >= maxScale}
      />
      <ButtonIcon
        text={t('carat.navigation.down')} icon={scaleDownIcon}
        action={scaleDown} disabled={scale <= minScale}
      />
      <div>
        <img src={scaleIcon} alt={'scale'} width={16} height={16}/>
        <span style={{whiteSpace: 'pre'}}>1 / </span>
        <NumericTextBox
          ref={ref} title={t('carat.navigation.scale')}
          width={100} style={{height: '20px'}} format={'#'}
          value={scale} step={step} min={minScale} max={maxScale} onChange={onScaleChange}
        />
      </div>
    </MenuSectionItem>
  );
};

const NavigationSection = ({stage}: CaratScalePanelProps) => {
  const { t } = useTranslation();
  const currentStratum = useCurrentStratum();
  const [trackIndex, setTrackIndex] = useState(stage.getActiveIndex());

  useEffect(() => {
    stage.subscribe('track', setTrackIndex);
    return () => stage.unsubscribe('track', setTrackIndex);
  }, [stage]);

  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const backgroundColumns = stage.getTrack(trackIndex).getBackgroundGroup().getColumns();
  const strataColumn = backgroundColumns.find(c => c.channel.type === 'lithology');
  const strata: CaratIntervalModel[] = strataColumn?.getElements() ?? [];

  const lookupID = strataColumn?.channel.info.stratumID.lookups.name?.id;
  const lookupData = useChannel(lookupID);

  const nameDict: LookupDict<string> = useMemo(() => {
    const rows = lookupData?.data?.rows;
    if (!rows) return {};
    return createLookupList(rows, lookupData.config.lookupColumns)[1];
  }, [lookupData]);

  const showStrata = (event: MouseEvent) => {
    const target = event.currentTarget;
    if (anchor !== target) setAnchor(target);
    setIsOpen(!isOpen);
  };

  const align = () => {
    stage.alignByStratum(currentStratum.id);
    stage.render();
  };

  const toTop = (id: StratumID) => {
    stage.gotoStratum(id, true);
    stage.render(); setIsOpen(false);
  };
  const toBottom = (id: StratumID) => {
    stage.gotoStratum(id, false);
    stage.render(); setIsOpen(false);
  };

  const elementToListItem = (element: CaratIntervalModel, i: number) => {
    const name = nameDict[element.stratumID];
    if (name === undefined) return null;
    const onClickTop = () => toTop(element.stratumID);
    const onClickBottom = () => toBottom(element.stratumID);

    return (
      <div key={i}>
        <strong>{name + ' '}</strong>
        <span onClick={onClickTop} title={t('carat.navigation.top-depth')}>
          {Math.round(element.top)}
        </span>
        {' 🠖 '}
        <span onClick={onClickBottom} title={t('carat.navigation.bottom-depth')}>
          {Math.round(element.bottom)}
        </span>
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
