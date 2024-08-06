import type { ToolbarActions } from '../../lib/types';
import { useTranslation } from 'react-i18next';
import { Spin } from 'antd';
import { ButtonIconStock } from 'shared/ui';
import { SelectionNavigation } from './selection-navigation';
import { EditButtons } from './edit-buttons';
import { ReloadButton } from './reload-button';
import { exportTableToExcel } from '../../store/table.thunks';
import './table-toolbar.scss';


interface TableToolbarProps {
  id: FormID;
  loading: boolean;
  state: TableState;
  actions: ToolbarActions;
  selectedRecords: TableRecordID[];
}


export const TableToolbar = ({id, loading, state, actions, selectedRecords}: TableToolbarProps) => {
  const { t } = useTranslation();

  return (
    <Spin spinning={loading} delay={400} size={'small'}>
      <div className={'table-toolbar'}>
        <ButtonIconStock
          icon={'excel'} title={t('table.toolbar.export-to-excel')}
          action={() => exportTableToExcel(id)}
        />
        <SelectionNavigation
          selectedRecords={selectedRecords} total={state.total}
          actions={actions} t={t}
        />
        {state.editable && <EditButtons
          state={state} actions={actions}
          selectedRecords={selectedRecords} t={t}
        />}
        <ReloadButton id={id} t={t}/>
      </div>
    </Spin>
  );
};
