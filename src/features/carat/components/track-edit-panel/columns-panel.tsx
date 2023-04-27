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
  const columns = track.getColumns();

  const setActiveGroup = (idx: number) => {
    const activeGroup = columns[idx];
    dispatch(setCaratActiveGroup(id, activeGroup));
    track.setActiveGroup(idx); stage.render();
  };

  const columnToLabel = (column: ICaratColumnGroup, i: number) => {
    const onClick = () => setActiveGroup(i);
    return <div key={i} onClick={onClick}>{column.getLabel()}</div>;
  };

  return (
    <MenuSection header={'Управление колонками'} style={{flexDirection: 'row'}}>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <ButtonIcon text={'Влево'} icon={moveLeftIcon} title={'Переместить активную колонку влево'}/>
        <ButtonIcon text={'Вправо'} icon={moveRightIcon} title={'Переместить активную колонку вправо'}/>
      </div>
      <div className={'carat-tracks'}>
        {columns.map(columnToLabel)}
      </div>
    </MenuSection>
  );
};
