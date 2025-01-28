import type { TFunction } from 'react-i18next';
import type { TableState } from '../../lib/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spin } from 'antd';
import { exportTableToExcel, reloadTable } from '../../store/table.thunks';
import './table-toolbar.scss';


interface TableToolbarProps {
  loading: boolean;
  state: TableState;
}
interface ToolbarButtonProps {
  id: FormID;
  t: TFunction;
}

export const TableToolbar = ({loading, state}: TableToolbarProps) => {
  const { t } = useTranslation();
  const { selection, toolbarSettings: settings, actions } = state;
  const { activeCell, records, editable, queryID } = state.data;

  const noData = records.length === 0;
  const noSelection = selection.empty();
  const isFirst = selection.is(0);
  const isLast = selection.is(records.length - 1);

  const activeRecord = activeCell.row !== null && records[activeCell.row];
  const rowAdding = activeRecord?.id === -1;
  const addDisabled = activeCell.edited || rowAdding || queryID === null;
  const removeDisabled = noSelection && !rowAdding;
  const endEditDisabled = !activeCell.edited;

  return (
    <Spin spinning={loading} delay={400} size={'small'}>
      <div className={'table-toolbar'}>
        {settings.exportToExcel !== false && <ExportButton id={state.id} t={t}/>}
        {settings.first !== false && <button
          aria-label={'first'} title={t('table.toolbar.first')}
          onClick={actions.moveToFirst} disabled={noData || isFirst}
        />}
        {settings.last !== false && <button
          aria-label={'last'} title={t('table.toolbar.last')}
          onClick={actions.moveToLast} disabled={noData || isLast}
        />}
        {settings.prev !== false && <button
          aria-label={'prev'} title={t('table.toolbar.prev')}
          onClick={() => actions.moveCellVertical(-1)} disabled={noSelection || isFirst}
        />}
        {settings.next !== false && <button
          aria-label={'next'} title={t('table.toolbar.next')}
          onClick={() => actions.moveCellVertical(1)} disabled={noSelection || isLast}
        />}
        {editable && settings.add !== false && <button
          aria-label={'add'} title={t('table.toolbar.add')}
          onClick={() => actions.addRecord(false)} disabled={addDisabled}
        />}
        {editable && settings.remove !== false && <button
          aria-label={'remove'} title={t('table.toolbar.remove')}
          onClick={actions.deleteRecords} disabled={removeDisabled}
        />}
        {editable && settings.accept !== false && <button
          aria-label={'accept'} title={t('table.toolbar.accept')}
          onClick={() => actions.endEdit(true)} disabled={endEditDisabled}
        />}
        {editable && settings.reject !== false && <button
          aria-label={'reject'} title={t('table.toolbar.reject')}
          onClick={() => actions.endEdit(false)} disabled={endEditDisabled}
        />}
        {settings.refresh !== false && <ReloadButton id={state.id} t={t}/>}
      </div>
    </Spin>
  );
};

const ExportButton = ({id, t}: ToolbarButtonProps) => {
  const [disabled, setDisabled] = useState(false);

  const onClick = () => {
    setDisabled(true);
    exportTableToExcel(id).then(() => setDisabled(false));
  };

  return (
    <button
      aria-label={'excel'} title={t('table.toolbar.excel')}
      onClick={onClick} disabled={disabled}
    />
  );
};

const ReloadButton = ({id, t}: ToolbarButtonProps) => {
  const [loading, setLoading] = useState(false);

  const onClick = () => {
    setLoading(true);
    reloadTable(id).then(() => setLoading(false));
  };

  return (
    <button
      aria-label={'reload'} title={t('table.toolbar.reload')}
      onClick={onClick} disabled={loading}
    />
  );
};
