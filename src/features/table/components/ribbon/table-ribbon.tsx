import { useTranslation } from 'react-i18next';
import { useTableState } from '../../store/table.store';
import { MenuSkeleton } from 'shared/ui';

import './table-ribbon.scss';
import { TableGlobalSection } from './section-global';
import { TableColumnSection } from './section-column';
import { TableFilterSection } from './section-filter';


export const TableRibbon = ({id}: FormRibbonProps) => {
  const { t } = useTranslation();
  const state = useTableState(id);

  if (!state) {
    const skeletonTemplate = ['220px', '344px', '100px'];
    return <MenuSkeleton template={skeletonTemplate}/>;
  }
  return (
    <div className={'menu'}>
      <TableGlobalSection state={state} t={t}/>
      <TableColumnSection state={state} t={t}/>
      <TableFilterSection state={state} t={t}/>
    </div>
  );
};
