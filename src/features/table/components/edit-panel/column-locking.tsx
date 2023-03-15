import { EditPanelItemProps } from '../../lib/types';
import { BigButtonToggle } from 'shared/ui';
import { setTableColumnsSettings, setTableColumns } from '../../store/tables.actions';
import columnsLockingIcon from 'assets/images/dataset/columns-locking.png';


export const ColumnLocking = ({id, state, dispatch, t}: EditPanelItemProps) => {
  const { columns, columnsSettings: settings } = state;
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
