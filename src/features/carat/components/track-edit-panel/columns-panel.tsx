import { useDispatch } from 'react-redux';
import { MenuSection, ButtonIcon } from 'shared/ui';
import { setCaratActiveGroup } from '../../store/carat.actions';

import moveLeftIcon from 'assets/images/carat/move-left.svg';
import moveRightIcon from 'assets/images/carat/move-right.svg';


interface CaratColumnsPanelProps {
  id: FormID;
  stage: ICaratStage;
  track: ICaratTrack;
  signal: () => void;
}


export const CaratColumnsPanel = ({id, stage, track, signal}: CaratColumnsPanelProps) => {
  const dispatch = useDispatch();
  const groups = track.getGroups();
  const activeIndex = track.getActiveIndex();

  const setActiveGroup = (idx: number) => {
    stage.edit({type: 'active-group', payload: idx});
    stage.render();
    dispatch(setCaratActiveGroup(id, groups[idx]));
  };

  const moveLeft = () => {
    stage.edit({type: 'move', payload: {idx: activeIndex, to: 'left'}});
    stage.render(); signal();
  };

  const moveRight = () => {
    stage.edit({type: 'move', payload: {idx: activeIndex, to: 'right'}});
    stage.render(); signal();
  };

  const columnToLabel = (column: ICaratColumnGroup, i: number) => {
    const onClick = () => setActiveGroup(i);
    const className = i === activeIndex ? 'active' : undefined;
    return <div key={i} className={className} onClick={onClick}>{column.settings.label}</div>;
  };

  return (
    <MenuSection header={'Управление колонками'} style={{flexDirection: 'row'}}>
      <div className={'carat-column-moving'}>
        <ButtonIcon
          text={'Влево'} icon={moveLeftIcon} title={'Переместить активную колонку влево'}
          action={moveLeft} disabled={activeIndex <= 0}
        />
        <ButtonIcon
          text={'Вправо'} icon={moveRightIcon} title={'Переместить активную колонку вправо'}
          action={moveRight} disabled={activeIndex >= groups.length - 1}
        />
      </div>
      <div className={'carat-tracks'}>
        {groups.map(columnToLabel)}
      </div>
    </MenuSection>
  );
};
