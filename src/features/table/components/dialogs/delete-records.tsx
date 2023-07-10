import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@progress/kendo-react-buttons';
import { Window, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { setOpenedWindow } from 'entities/windows';
import { deleteTableRecords } from '../../store/table.thunks';


interface DeleteRecordsDialogProps {
  id: FormID,
  indexes: TableRecordID[],
}


/** Диалог с подтверждением при удалении строк. */
export const DeleteRecordsDialog = ({id, indexes}: DeleteRecordsDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const onClose = () => {
    dispatch(setOpenedWindow('delete-records', false, null));
  };

  const onApply = () => {
    dispatch(deleteTableRecords(id, indexes));
    onClose();
  };

  return (
    <Window
      title={t('table.delete-dialog.header')}
      height={180} resizable={false} onClose={onClose}
    >
      <p style={{margin: 10, textAlign: 'center'}}>
        {t('table.delete-dialog.details', {n: indexes.length})}
      </p>
      <DialogActionsBar>
        <Button onClick={onApply}>
          {t('base.ok')}
        </Button>
        <Button onClick={onClose}>
          {t('base.cancel')}
        </Button>
      </DialogActionsBar>
    </Window>
  );
};
