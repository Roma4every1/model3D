import { type MouseEvent, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRender } from 'shared/react';
import { inputIntParser } from 'shared/locales';
import { useCurrentStratum } from 'entities/objects';
import { useChannel, createLookupList } from 'entities/channel';
import { validateCaratScale } from '../../lib/utils';
import { constraints } from '../../lib/constants';
import { InputNumber, Popover } from 'antd';
import { MenuSection, MenuSectionItem, ButtonIcon, BigButton } from 'shared/ui';
import { CaratViewportSetter } from './viewport-setter';

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
  const track = stage.getActiveTrack();
  const [scale, setScale] = useState(Math.round(CaratDrawer.pixelPerMeter / track.viewport.scale));

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

  const changeScale = (newScale: number) => {
    newScale = validateCaratScale(newScale, !track.constructionMode);
    stage.setScale(newScale);
    stage.render();
  };

  const onScaleChange = (newScale: number | null) => {
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
        <InputNumber
          style={{width: 85, height: 20}} prefix={'1 /'} title={t('carat.navigation.scale')}
          value={scale} step={step} min={minScale} max={maxScale} onChange={onScaleChange}
          parser={inputIntParser} changeOnWheel={true} controls={false}
        />
      </div>
    </MenuSectionItem>
  );
};

const NavigationSection = ({stage}: CaratScalePanelProps) => {
  const { t } = useTranslation();
  const render = useRender();
  const currentStratum = useCurrentStratum();

  useEffect(() => {
    stage.subscribe('track', render);
    return () => stage.unsubscribe('track', render);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const backgroundColumns = stage.getActiveTrack().getBackgroundGroup().getColumns();
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

  const toListItem = (element: CaratIntervalModel, i: number) => {
    const name = nameDict[element.stratumID];
    if (name === undefined) return null;

    const onClickTop = (e: MouseEvent) => {
      e.stopPropagation();
      toTop(element.stratumID);
    };
    const onClickBottom = (e: MouseEvent) => {
      e.stopPropagation();
      toBottom(element.stratumID);
    };

    return (
      <div key={i} onClick={onClickTop}>
        <strong>{name}</strong>
        <span onClick={onClickTop} title={t('carat.navigation.top-depth')}>
          {Math.round(element.top)}
        </span>
        {'→'}
        <span onClick={onClickBottom} title={t('carat.navigation.bottom-depth')}>
          {Math.round(element.bottom)}
        </span>
      </div>
    );
  };

  const content = (
    <>
      <CaratViewportSetter stage={stage} t={t}/>
      {currentStratum && <section className={'strata-list'}>
        <div onClick={() => toTop(currentStratum.id)}>
          {t('carat.navigation.active-top')}
        </div>
        <div onClick={() => toBottom(currentStratum.id)}>
          {t('carat.navigation.active-bottom')}
        </div>
      </section>}
      <section className={'strata-list'} style={{marginTop: 4}}>
        {strata.map(toListItem)}
      </section>
    </>
  );

  return (
    <MenuSectionItem className={'big-buttons'}>
      <Popover
        trigger={'click'} placement={'bottomLeft'} arrow={false}
        content={content} overlayClassName={'carat-navigation-popover'}
      >
        <BigButton
          text={t('carat.navigation.goto')} icon={goToStratumIcon}
          onClick={showStrata} disabled={strata.length === 0}
        />
      </Popover>
      <BigButton
        text={t('carat.navigation.align')} icon={alignByStratumIcon}
        onClick={align} disabled={!currentStratum}
      />
    </MenuSectionItem>
  );
};
