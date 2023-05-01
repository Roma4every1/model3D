import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { MenuSection, ButtonIcon } from 'shared/ui';
import { setCaratActiveGroup } from '../../store/carats.actions';

import moveLeftIcon from 'assets/images/carat/move-left.svg';
import moveRightIcon from 'assets/images/carat/move-right.svg';


interface CaratColumnsPanelProps {
  id: FormID,
  stage: ICaratStage,
  track: ICaratTrack,
}


export const CaratColumnsPanel = ({id, stage, track}: CaratColumnsPanelProps) => {
  const dispatch = useDispatch();
  const [signal, setSignal] = useState(false);

  const groups = track.getGroups();
  const activeIndex = track.getActiveIndex();

  const setActiveGroup = (idx: number) => {
    track.setActiveGroup(idx); stage.render();
    dispatch(setCaratActiveGroup(id, groups[idx]));
  };

  const moveLeft = () => {
    track.moveGroup(activeIndex, 'left');
    stage.render();
    setSignal(!signal);
  };

  const moveRight = () => {
    track.moveGroup(activeIndex,'right');
    stage.render();
    setSignal(!signal);
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
