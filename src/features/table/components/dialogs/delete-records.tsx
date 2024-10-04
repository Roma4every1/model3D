import type { TableState } from '../../lib/types';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { deleteTableRecords } from '../../store/table.thunks';


interface DeleteRecordsDialogProps {
  state: TableState;
  onClose: () => void;
}


/** Диалог с подтверждением при удалении строк. */
export const DeleteRecordsDialog = ({state, onClose}: DeleteRecordsDialogProps) => {
  const { t } = useTranslation();
  const indexes = [...state.selection];
  const onApply = () => { deleteTableRecords(state.id, indexes).then(); onClose(); };

  return (
    <>
      <p>
        {t('table.delete-confirm', {n: indexes.length})}
      </p>
      <div className={'wm-dialog-actions'}>
        <Button onClick={onApply}>{t('base.yes')}</Button>
        <Button onClick={onClose}>{t('base.no')}</Button>
      </div>
    </>
  );
};
