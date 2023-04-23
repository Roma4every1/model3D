import { useDispatch } from 'react-redux';
import { MenuSection } from 'shared/ui';
import { setCaratActiveGroup } from '../../store/carats.actions';


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
    track.setActiveColumn(idx); stage.render();
  };

  const columnToLabel = (column: ICaratColumnGroup, i: number) => {
    const onClick = () => setActiveGroup(i);
    return <div key={i} onClick={onClick}>{column.getLabel()}</div>;
  };

  return (
    <MenuSection header={'Управление колонками'} style={{flexDirection: 'row'}}>
      <div>
        <div>Вправо</div>
        <div>Влево</div>
      </div>
      <div className={'carat-tracks'}>
        {columns.map(columnToLabel)}
      </div>
    </MenuSection>
  );
};
