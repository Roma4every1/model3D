import { useCallback} from 'react';
import { EditPanelItemProps } from '../../lib/types';
import { setTableColumnsSettings } from '../../store/table.actions';

import { BigButtonToggle, MenuSection } from 'shared/ui';
import recordModeIcon from 'assets/images/dataset/record-mode.png';
import tableModeIcon from 'assets/images/dataset/table-mode.png';


export const ColumnMode = ({id, state, t}: EditPanelItemProps) => {
  const { columnsSettings: settings } = state;
  const isTableMode = settings.isTableMode;

  const toggleTableModeOn = useCallback((value: boolean) => {
    if (isTableMode === value) return;
    const newSettings = {...settings, isTableMode: value};
    setTableColumnsSettings(id, newSettings);
  }, [id, settings, isTableMode]);

  return (
    <MenuSection className={'big-buttons'} header={t('table.panel.mode.header')}>
      <BigButtonToggle
        text={t('table.panel.mode.off')}
        title={t('table.panel.mode.off-title')}
        icon={recordModeIcon}
        active={isTableMode === false}
        action={() => toggleTableModeOn(false)}
      />
      <BigButtonToggle
        text={t('table.panel.mode.on')}
        title={t('table.panel.mode.on-title')}
        icon={tableModeIcon}
        active={isTableMode === true}
        action={() => toggleTableModeOn(true)}
      />
    </MenuSection>
  );
};
