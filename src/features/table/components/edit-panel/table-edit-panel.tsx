import { EditPanelItemProps } from '../../lib/types';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { MenuSection, MenuSkeleton } from 'shared/ui';
import { tableStateSelector } from '../../store/table.selectors';

import { ExcelExport } from './excel-export';
import { ColumnStatistics } from './column-statistics';
import { ColumnVisibility } from './column-visibility'
import { SelectAll } from './select-all';
import { ColumnLocking } from './column-locking';
import { ColumnControls } from './column-controls';

import './table-edit-panel.scss';


export const TableEditPanel = ({id}: FormEditPanelProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const state: TableState = useSelector(tableStateSelector.bind(id));
  if (!state) return <MenuSkeleton template={['250px', '90px', '105px', '405px']}/>;

  const props: EditPanelItemProps = {id, state, dispatch, t};
  return (
    <div className={'menu'}>
      <MenuSection header={t('table.panel.functions.header')} className={'map-actions'}>
        <ExcelExport {...props}/>
        <ColumnStatistics {...props}/>
        <ColumnVisibility {...props}/>
      </MenuSection>
      <MenuSection header={t('table.panel.selection.header')} className={'map-actions'}>
        <SelectAll {...props}/>
      </MenuSection>
      <MenuSection header={t('table.panel.params.header')} className={'map-actions'}>
        <ColumnLocking {...props}/>
      </MenuSection>
      <ColumnControls {...props}/>
    </div>
  );
};
