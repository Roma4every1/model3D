import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuSection, ButtonIcon } from 'shared/ui';

import { CaratStage } from '../../rendering/stage';
import { CaratColumnGroup } from '../../rendering/column-group';

import moveLeftIcon from 'assets/images/carat/move-left.svg';
import moveRightIcon from 'assets/images/carat/move-right.svg';


interface CaratColumnsPanelProps {
  stage: CaratStage;
}


export const CaratGroupSection = ({stage}: CaratColumnsPanelProps) => {
  const { t } = useTranslation();
  const track = stage.getActiveTrack();
  const groups = track.getGroups();
  const [activeIndex, setActiveIndex] = useState(track.getActiveIndex());

  useEffect(() => {
    stage.subscribe('group', setActiveIndex);
    return () => stage.unsubscribe('group', setActiveIndex);
  }, [stage]);

  const setActiveGroup = (idx: number) => {
    stage.setActiveGroup(idx);
    stage.render();
  };
  const moveLeft = () => {
    stage.moveGroup(activeIndex, 'left');
    stage.render();
  };
  const moveRight = () => {
    stage.moveGroup(activeIndex, 'right');
    stage.render();
  };

  const columnToLabel = (column: CaratColumnGroup, i: number) => {
    const text = column.settings.label
      ? column.settings.label
      : <span style={{color: '#999'}}>{t('carat.columns.no-label')}</span>;

    const onClick = () => setActiveGroup(i);
    const className = i === activeIndex ? 'active' : undefined;
    return <div key={i} className={className} onClick={onClick}>{text}</div>;
  };

  return (
    <MenuSection header={t('carat.columns.header')} style={{flexDirection: 'row'}}>
      <div className={'carat-column-moving'}>
        <ButtonIcon
          text={t('carat.columns.move-left')} title={t('carat.columns.move-left-title')}
          icon={moveLeftIcon} action={moveLeft} disabled={activeIndex <= 0}
        />
        <ButtonIcon
          text={t('carat.columns.move-right')} title={t('carat.columns.move-right-title')}
          icon={moveRightIcon} action={moveRight} disabled={activeIndex >= groups.length - 1}
        />
      </div>
      <div className={'carat-column-groups'}>
        {groups.map(columnToLabel)}
      </div>
    </MenuSection>
  );
};
