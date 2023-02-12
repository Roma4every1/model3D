import { useTranslation } from 'react-i18next';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';


interface DeleteRowsDialogProps {
  count: number,
  onClose: () => void,
  onApply: () => void,
}


export const DeleteRowsDialog = ({count, onClose, onApply}: DeleteRowsDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog title={t('table.delete-rows-header')} onClose={onClose}>
      <p style={{margin: '25px', textAlign: 'center'}}>
        {t('table.delete-rows', {n: count})}
      </p>
      <DialogActionsBar>
        <Button className={'actionbutton'} onClick={onApply}>
          {t('base.ok')}
        </Button>
        <Button className={'actionbutton'} onClick={onClose}>
          {t('base.cancel')}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
};
