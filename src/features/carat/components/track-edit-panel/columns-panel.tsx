import { useDispatch } from 'react-redux';
import { MenuSection } from 'shared/ui';
import { setCaratActiveColumn } from '../../store/carats.actions';


interface CaratColumnsPanelProps {
  id: FormID,
  model: ICaratViewModel,
  drawer: ICaratDrawer,
}


export const CaratColumnsPanel = ({id, model, drawer}: CaratColumnsPanelProps) => {
  const dispatch = useDispatch();
  const columns = model.getColumns();

  const setActiveColumn = (idx: number) => {
    const activeColumn = columns[idx];
    dispatch(setCaratActiveColumn(id, activeColumn));
    model.setActiveColumn(idx); drawer.render();
  };

  const columnToLabel = (column: CaratColumnInit, i: number) => {
    const onClick = () => setActiveColumn(i);
    return <div key={i} onClick={onClick}>{column.settings.label}</div>;
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
