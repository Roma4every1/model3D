import {EditPanelItemProps} from '../../lib/types.ts';
import columnsLockingIcon from '../../../../assets/images/dataset/columns-locking.png';
import {BigButtonToggle, MenuSection} from '../../../../shared/ui';
import {useCallback} from 'react';
import {setTableColumnsSettings} from '../../store/table.actions.ts';

export const ColumnMode = ({id, state, dispatch, t}: EditPanelItemProps) => {
  const { columnsSettings: settings } = state;
  const isTableMode = settings.isTableMode;

  const toggleTableModeOn = useCallback((value: boolean) => {
    if (isTableMode === value) return;
    const newSettings = {...settings, isTableMode: value};
    dispatch(setTableColumnsSettings(id, newSettings));
  }, [dispatch, id, settings, isTableMode]);

  return (
    <MenuSection className={'big-buttons'} header={t('table.panel.mode.header')}>
      <BigButtonToggle
        text={t('table.panel.mode.off')}
        title={t('table.panel.mode.off-title')}
        icon={columnsLockingIcon}
        active={isTableMode === false}
        action={() => toggleTableModeOn(false)}
      />
      <BigButtonToggle
        text={t('table.panel.mode.on')}
        title={t('table.panel.mode.on-title')}
        icon={columnsLockingIcon}
        active={isTableMode === true}
        action={() => toggleTableModeOn(true)}
      />
    </MenuSection>
  );
};
