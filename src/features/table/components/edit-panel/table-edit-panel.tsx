import { EditPanelItemProps } from '../../lib/types';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { MenuSection, MenuSkeleton } from 'shared/ui';
import { tableStateSelector } from '../../store/table.selectors';

import './table-edit-panel.scss';
import { ExcelExport } from './excel-export';
import { ColumnVisibility } from './column-visibility'
import { SelectAll } from './select-all';
import { ColumnLocking } from './column-locking';
import { ColumnControls } from './column-controls';
import { ColumnMode } from './column-mode';


export const TableEditPanel = ({id}: FormEditPanelProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const state: TableState = useSelector(tableStateSelector.bind(id));
  if (!state) return <MenuSkeleton template={['250px', '90px', '105px', '405px']}/>;

  const props: EditPanelItemProps = {id, state, dispatch, t};
  return (
    <div className={'menu'}>
      <ColumnMode {...props}/>
      <MenuSection className={'big-buttons'} header={t('table.panel.functions.header')}>
        <ExcelExport {...props}/>
        <ColumnVisibility {...props}/>
        <SelectAll {...props}/>
        <ColumnLocking {...props}/>
      </MenuSection>
      <ColumnControls {...props}/>
    </div>
  );
};
