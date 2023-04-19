import { useDispatch } from 'react-redux';
import { MenuSection } from 'shared/ui';
import { setCaratActiveColumn } from '../../store/carats.actions';


interface CaratColumnsPanelProps {
  id: FormID,
  stage: ICaratStage,
  track: ICaratTrack,
}


export const CaratColumnsPanel = ({id, stage, track}: CaratColumnsPanelProps) => {
  const dispatch = useDispatch();
  const columns = track.getColumns();

  const setActiveColumn = (idx: number) => {
    const activeColumn = columns[idx];
    dispatch(setCaratActiveColumn(id, activeColumn));
    track.setActiveColumn(idx); stage.render();
  };

  const columnToLabel = (column: ICaratColumn, i: number) => {
    const onClick = () => setActiveColumn(i);
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
