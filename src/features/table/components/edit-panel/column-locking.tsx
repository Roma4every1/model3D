import { TFunction } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { BigButtonToggle } from 'shared/ui';
import { setTableColumnsSettings, setTableColumns } from '../../store/tables.actions';
import columnsLockingIcon from 'assets/images/dataset/columns-locking.png';


interface ColumnLockingProps {
  id: FormID,
  settings: TableColumnsSettings,
  columns: TableColumnsState,
  t: TFunction
}


export const ColumnLocking = ({id, settings, columns, t}: ColumnLockingProps) => {
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
      text={t('table.panel.params.locking')} icon={columnsLockingIcon}
      active={lockingEnabled} action={toggleColumnLocking}
    />
  );
};
