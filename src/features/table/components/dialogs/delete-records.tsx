import { TFunction } from 'react-i18next';
import { Button } from '@progress/kendo-react-buttons';
import { deleteTableRecords } from '../../store/table.thunks';


interface DeleteRecordsDialogProps {
  id: FormID;
  indexes: TableRecordID[];
  t: TFunction;
  onClose: () => void;
}


/** Диалог с подтверждением при удалении строк. */
export const DeleteRecordsDialog = ({id, indexes, t, onClose}: DeleteRecordsDialogProps) => {
  const onApply = () => {
    deleteTableRecords(id, indexes).then();
    onClose();
  };

  return (
    <>
      <p style={{margin: 10, textAlign: 'center'}}>
        {t('table.delete-dialog.details', {n: indexes.length})}
      </p>
      <div className={'wm-dialog-actions'}>
        <Button onClick={onApply}>{t('base.ok')}</Button>
        <Button onClick={onClose}>{t('base.cancel')}</Button>
      </div>
    </>
  );
};
