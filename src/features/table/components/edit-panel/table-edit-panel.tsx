import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { MenuSection, MenuSkeleton } from 'shared/ui';
import { tableStateSelector } from '../../store/tables.selectors';

import { ExcelExport } from './excel-export';
import { ColumnStatistics } from './column-statistics';
import { ColumnVisibility } from './column-visibility'
import { SelectAll } from './select-all';
import { ColumnLocking } from './column-locking';
import { ColumnControls } from './column-controls';

import './table-edit-panel.scss';


export const TableEditPanel = ({id}: FormEditPanelProps) => {
  const { t } = useTranslation();
  const tableState: TableState = useSelector(tableStateSelector.bind(id));
  if (!tableState) return <MenuSkeleton template={['250px', '90px', '105px', '405px']}/>;

  return (
    <div className={'menu'}>
      <MenuSection header={t('table.panel.functions.header')} className={'map-actions'}>
        <ExcelExport id={id} t={t}/>
        <ColumnStatistics state={tableState} t={t}/>
        <ColumnVisibility id={id} tree={tableState.columnTree} t={t}/>
      </MenuSection>
      <MenuSection header={t('table.panel.selection.header')} className={'map-actions'}>
        <SelectAll id={id} state={tableState} t={t}/>
      </MenuSection>
      <MenuSection header={t('table.panel.params.header')} className={'map-actions'}>
        <ColumnLocking id={id} settings={tableState.columnsSettings} columns={tableState.columns} t={t}/>
      </MenuSection>
      <ColumnControls id={id} state={tableState} t={t}/>
    </div>
  );
};
