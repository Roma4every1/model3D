import { useDispatch } from 'react-redux';
import { BigButtonToggle } from 'shared/ui';
import { setTableColumnsSettings, setTableColumns } from '../../store/tables.actions';
import columnsLockingIcon from 'assets/images/dataset/columns-locking.png';


interface ColumnLockingProps {
  id: FormID,
  settings: TableColumnsSettings,
  columns: TableColumnsState,
}


export const ColumnLocking = ({id, settings, columns}: ColumnLockingProps) => {
  const dispatch = useDispatch();
  const lockingEnabled = settings.isLockingEnabled;

  const toggleColumnLocking = () => {
    const newSettings = {...settings, isLockingEnabled: !lockingEnabled};
    if (lockingEnabled) {
      newSettings.lockedCount = 0;
      for (const column of Object.values(columns)) column.locked = false;
      dispatch(setTableColumns(id, {...columns}));
    }
    dispatch(setTableColumnsSettings(id, newSettings));
  };

  return (
    <BigButtonToggle
      text={'Фиксация колонок'} icon={columnsLockingIcon}
      active={lockingEnabled} action={toggleColumnLocking}
    />
  );
};
