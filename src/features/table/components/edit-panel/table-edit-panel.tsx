import { useSelector } from 'react-redux';
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
  const tableState: TableState = useSelector(tableStateSelector.bind(id));
  if (!tableState) return <MenuSkeleton template={['250px', '90px', '105px', '405px']}/>;

  return (
    <div className={'menu'}>
      <MenuSection header={'Функции'} className={'map-actions'}>
        <ExcelExport/>
        <ColumnStatistics state={tableState}/>
        <ColumnVisibility id={id} tree={tableState.columnTree}/>
      </MenuSection>
      <MenuSection header={'Выделение'} className={'map-actions'}>
        <SelectAll id={id} state={tableState}/>
      </MenuSection>
      <MenuSection header={'Параметры'} className={'map-actions'}>
        <ColumnLocking id={id} settings={tableState.columnsSettings} columns={tableState.columns}/>
      </MenuSection>
      <ColumnControls id={id} state={tableState}/>
    </div>
  );
};
