import { useTranslation } from 'react-i18next';
import { MenuSection, ButtonIcon } from 'shared/ui';
import moveLeftIcon from 'assets/images/carat/move-left.svg';
import moveRightIcon from 'assets/images/carat/move-right.svg';


interface CaratColumnsPanelProps {
  stage: ICaratStage;
  track: ICaratTrack;
}


export const CaratColumnPanel = ({stage, track}: CaratColumnsPanelProps) => {
  const { t } = useTranslation();
  const groups = track.getGroups();
  const activeIndex = track.getActiveIndex();

  const setActiveGroup = (idx: number) => {
    stage.edit({type: 'active-group', payload: idx});
    stage.render();
  };

  const moveLeft = () => {
    stage.edit({type: 'move', payload: {idx: activeIndex, to: 'left'}});
    stage.render();
  };

  const moveRight = () => {
    stage.edit({type: 'move', payload: {idx: activeIndex, to: 'right'}});
    stage.render();
  };

  const columnToLabel = (column: ICaratColumnGroup, i: number) => {
    const text = column.settings.label
      ? column.settings.label
      :<span style={{color: '#999'}}>{t('carat.columns.no-label')}</span>;

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
